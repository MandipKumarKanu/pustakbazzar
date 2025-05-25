const User = require("../models/User");
const Book = require("../models/Book"); // Add this import

const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveSeller = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.isSeller.status = "approved";
    await user.save();

    res.status(200).json({ message: "Seller approved." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectSeller = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.isSeller.status = "rejected";
    await user.save();

    res.status(200).json({ message: "Seller application rejected." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getApprovedSellers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sellers = await User.find({ "isSeller.status": "approved" })
      .select("-password -refreshToken")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalSellers = await User.countDocuments({
      "isSeller.status": "approved",
    });

    res.status(200).json({
      sellers,
      pagination: {
        totalSellers,
        totalPages: Math.ceil(totalSellers / limitNum),
        currentPage: pageNum,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPlatformFeeReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;

    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    end.setHours(23, 59, 59, 999);

    const matchStage = {
      date: { $gte: start, $lte: end },
    };

    let groupByConfig = {};
    let sortConfig = {};

    switch (groupBy) {
      case "daily":
        groupByConfig = {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          period: {
            $first: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          },
        };
        sortConfig = { _id: 1 };
        break;
      case "weekly":
        groupByConfig = {
          _id: { $week: "$date" },
          period: {
            $first: {
              $concat: ["Week ", { $toString: { $week: "$date" } }],
            },
          },
        };
        sortConfig = { _id: 1 };
        break;
      case "monthly":
      default:
        groupByConfig = {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          period: {
            $first: {
              $dateToString: { format: "%Y-%m", date: "$date" },
            },
          },
        };
        sortConfig = { "_id.year": 1, "_id.month": 1 };
    }

    groupByConfig.totalFees = { $sum: "$platformFee" };
    groupByConfig.transactionCount = { $sum: 1 };
    groupByConfig.averageFee = { $avg: "$platformFee" };

    const PlatformEarning = require("../models/PlatformEarning");
    const report = await PlatformEarning.aggregate([
      { $match: matchStage },
      { $group: groupByConfig },
      { $sort: sortConfig },
    ]);

    const totalTransactions = report.reduce(
      (sum, period) => sum + period.transactionCount,
      0
    );

    const averageFeePerTransaction =
      totalTransactions > 0
        ? report.reduce((sum, period) => sum + period.totalFees, 0) /
          totalTransactions
        : 0;

    const summary = {
      totalPeriods: report.length,
      totalFees: report.reduce((sum, period) => sum + period.totalFees, 0),
      totalTransactions,
      averageFeePerTransaction,
    };

    res.status(200).json({
      success: true,
      data: report,
      summary,
      timeframe: {
        startDate: start,
        endDate: end,
        groupBy: groupBy || "monthly",
      },
    });
  } catch (error) {
    console.error("Error generating platform fee report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate platform fee report",
      error: error.message,
    });
  }
};

const getSalesPerformanceReport = async (req, res) => {
  try {
    const { startDate, endDate, group } = req.query;

    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    end.setHours(23, 59, 59, 999);

    const Order = require("../models/Order");

    const totalOrdersInDb = await Order.countDocuments({});

    const orders = await Order.find({
      $or: [
        { date: { $gte: start, $lte: end } },
        { createdAt: { $gte: start, $lte: end } },
      ],
      paymentStatus: "paid",
    })
      .populate("orders.books.bookId")
      .populate("userId", "profile.userName")
      .lean();

    orders.forEach((order) => {
      if (!order.createdAt && order.date) {
        order.createdAt = order.date;
      } else if (!order.createdAt) {
        order.createdAt = new Date();
      }
    });

    // console.log(`Debug: Found ${orders.length} paid orders within date range out of ${totalOrdersInDb} total orders`);
    // console.log(`Debug: Date range from ${start.toISOString()} to ${end.toISOString()}`);

    let usingSampleData = false;
    if (orders.length === 0) {
      console.log("No paid orders found within the specified date range.");

      return res.status(200).json({
        success: true,
        data: {
          timeframe: {
            startDate: start,
            endDate: end,
            groupBy: group || "monthly",
          },
          summary: {
            totalOrders: 0,
            totalRevenue: 0,
            totalItemsSold: 0,
            averageOrderValue: 0,
          },
          timeSeriesData: [],
          categoryPerformance: [],
          message: "No orders found for the specified date range",
        },
      });
    }

    const groupByTime = (orders, groupType) => {
      return orders.reduce((acc, order) => {
        let key;

        let date;
        try {
          date = new Date(order.createdAt || order.date);

          if (isNaN(date.getTime())) {
            console.log(
              `Invalid date found in order ${order._id}, using current date`
            );
            date = new Date();
          }
        } catch (err) {
          console.log(
            `Error processing date for order ${order._id}: ${err.message}`
          );
          date = new Date();
        }

        switch (groupType) {
          case "daily":
            key = date.toISOString().split("T")[0];
            break;
          case "weekly":
            const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
            const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
            const weekNum = Math.ceil(
              (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7
            );
            key = `${date.getFullYear()}-W${weekNum}`;
            break;
          case "monthly":
          default:
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
              2,
              "0"
            )}`;
        }

        if (!acc[key]) {
          acc[key] = {
            period: key,
            orderCount: 0,
            totalRevenue: 0,
            itemsSold: 0,
            orders: [],
          };
        }

        const allBooks =
          order.orders?.flatMap((subOrder) => subOrder.books) || [];

        const orderTotal = order.netTotal || 0;
        const itemCount = allBooks.reduce(
          (sum, book) => sum + (book.quantity || 0),
          0
        );

        acc[key].orderCount++;
        acc[key].totalRevenue += orderTotal;
        acc[key].itemsSold += itemCount;
        acc[key].orders.push({
          id: order._id,
          customer: order.userId?.profile?.userName || "Unknown",
          total: orderTotal,
          status: order.orderStatus,
          items: itemCount,
        });

        return acc;
      }, {});
    };

    const groupBy = group || "monthly";
    const timeGroupedData = groupByTime(orders, groupBy);

    const timeSeriesData = Object.values(timeGroupedData).sort((a, b) =>
      a.period.localeCompare(b.period)
    );

    const categoryPerformance = orders.reduce((acc, order) => {
      order.orders?.forEach((subOrder) => {
        subOrder.books?.forEach((book) => {
          if (!book.bookId) return;

          const category = book.bookId.category || "Uncategorized";
          if (!acc[category]) {
            acc[category] = {
              category,
              itemsSold: 0,
              revenue: 0,
            };
          }

          acc[category].itemsSold += book.quantity || 0;
          acc[category].revenue += (book.price || 0) * (book.quantity || 0);
        });
      });

      return acc;
    }, {});

    const categoryData = Object.values(categoryPerformance).sort(
      (a, b) => b.revenue - a.revenue
    );

    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.netTotal || 0),
      0
    );

    const totalItemsSold = orders.reduce((sum, order) => {
      const bookCount =
        order.orders?.reduce((subSum, subOrder) => {
          return (
            subSum +
              subOrder.books?.reduce(
                (bookSum, book) => bookSum + (book.quantity || 0),
                0
              ) || 0
          );
        }, 0) || 0;

      return sum + bookCount;
    }, 0);

    const averageOrderValue =
      orders.length > 0 ? totalRevenue / orders.length : 0;

    res.status(200).json({
      success: true,
      data: {
        timeframe: {
          startDate: start,
          endDate: end,
          groupBy,
        },
        summary: {
          totalOrders: orders.length,
          totalRevenue,
          totalItemsSold,
          averageOrderValue,
        },
        timeSeriesData,
        categoryPerformance: categoryData,
        debug: {
          usingSampleData,
          totalOrdersInDb,
          queryDateRange: {
            start: start.toISOString(),
            end: end.toISOString(),
          },
        },
      },
    });
  } catch (error) {
    console.error("Error generating sales performance report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate sales performance report",
      error: error.message,
    });
  }
};

const getBookActivityReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = "monthly" } = req.query;

    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate) : new Date();

    end.setHours(23, 59, 59, 999);

    const matchStage = {
      createdAt: { $gte: start, $lte: end },
    };

    let groupByConfig = {};
    let sortConfig = {};

    switch (groupBy) {
      case "daily":
        groupByConfig = {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          period: {
            $first: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
        };
        sortConfig = { _id: 1 };
        break;
      case "weekly":
        groupByConfig = {
          _id: {
            year: { $year: "$createdAt" },
            week: { $week: "$createdAt" },
          },
          period: {
            $first: {
              $concat: [
                { $toString: { $year: "$createdAt" } },
                "-W",
                { $toString: { $week: "$createdAt" } },
              ],
            },
          },
        };
        sortConfig = { "_id.year": 1, "_id.week": 1 };
        break;
      case "monthly":
      default:
        groupByConfig = {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          period: {
            $first: {
              $dateToString: { format: "%Y-%m", date: "$createdAt" },
            },
          },
        };
        sortConfig = { "_id.year": 1, "_id.month": 1 };
    }

    const saleBooks = await Book.aggregate([
      {
        $match: {
          ...matchStage,
          forDonation: false,
        },
      },
      {
        $group: {
          ...groupByConfig,
          count: { $sum: 1 },
          categories: {
            $push: {
              $cond: [
                { $ifNull: ["$category", false] },
                "$category",
                "Uncategorized",
              ],
            },
          },
        },
      },
      { $sort: sortConfig },
    ]);

    const donatedBooks = await Book.aggregate([
      {
        $match: {
          ...matchStage,
          forDonation: true,
        },
      },
      {
        $group: {
          ...groupByConfig,
          count: { $sum: 1 },
          categories: {
            $push: {
              $cond: [
                { $ifNull: ["$category", false] },
                "$category",
                "Uncategorized",
              ],
            },
          },
        },
      },
      { $sort: sortConfig },
    ]);

    const Order = require("../models/Order");
    
    const orderDateMatchStage = {
      date: { $gte: start, $lte: end },
      paymentStatus: "paid", 
    };
    
    let orderGroupByConfig = {};
    
    switch (groupBy) {
      case "daily":
        orderGroupByConfig = {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          period: { $first: { $dateToString: { format: "%Y-%m-%d", date: "$date" } } },
        };
        break;
      case "weekly":
        orderGroupByConfig = {
          _id: {
            year: { $year: "$date" },
            week: { $week: "$date" },
          },
          period: {
            $first: {
              $concat: [
                { $toString: { $year: "$date" } },
                "-W",
                { $toString: { $week: "$date" } },
              ],
            },
          },
        };
        break;
      case "monthly":
      default:
        orderGroupByConfig = {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          period: {
            $first: { $dateToString: { format: "%Y-%m", date: "$date" } },
          },
        };
    }
    
    orderGroupByConfig.count = { $sum: 1 };
    orderGroupByConfig.totalRevenue = { $sum: "$netTotal" };
    orderGroupByConfig.itemsSold = { 
      $sum: {
        $reduce: {
          input: "$orders",
          initialValue: 0,
          in: {
            $add: [
              "$$value",
              {
                $reduce: {
                  input: "$$this.books",
                  initialValue: 0,
                  in: { $add: ["$$value", "$$this.quantity"] }
                }
              }
            ]
          }
        }
      }
    };

    const salesData = await Order.aggregate([
      { $match: orderDateMatchStage },
      { $group: orderGroupByConfig },
      { $sort: sortConfig }
    ]);

    const soldBooks = await Book.aggregate([
      {
        $match: {
          ...matchStage,
          status: "sold",
        },
      },
      {
        $group: {
          ...groupByConfig,
          count: { $sum: 1 },
          categories: {
            $push: {
              $cond: [
                { $ifNull: ["$category", false] },
                "$category",
                "Uncategorized",
              ],
            },
          },
        },
      },
      { $sort: sortConfig },
    ]);

    const mergedSoldBooks = soldBooks.map(bookData => {
      const matchingSalesData = salesData.find(sale => sale.period === bookData.period);
      return {
        ...bookData,
        revenue: matchingSalesData ? matchingSalesData.totalRevenue : 0,
        itemsSold: matchingSalesData ? matchingSalesData.itemsSold : bookData.count,
      };
    });

    const categoryIds = [
      ...new Set([
        ...saleBooks.flatMap((period) => period.categories.flat()),
        ...donatedBooks.flatMap((period) => period.categories.flat()),
        ...soldBooks.flatMap((period) => period.categories.flat()),
      ]),
    ].filter((id) => id !== "Uncategorized");

    const Category = require("../models/Category");
    const categories = await Category.find({
      _id: { $in: categoryIds },
    }).lean();

    const categoryMap = categories.reduce((map, cat) => {
      map[cat._id.toString()] = cat.categoryName;
      return map;
    }, {});

    const currentInventory = await Book.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const inventoryStats = currentInventory.reduce((stats, item) => {
      stats[item._id] = item.count;
      return stats;
    }, {});

    const processCategoryData = (data, includeRevenue = false) => {
      const processedData = data.map((period) => {
        const categoryCounts = period.categories.reduce((acc, catId) => {
          const catIdStr = catId ? catId.toString() : "Uncategorized";
          acc[catIdStr] = (acc[catIdStr] || 0) + 1;
          return acc;
        }, {});

        const topCategories = Object.entries(categoryCounts)
          .map(([catId, count]) => ({
            name: categoryMap[catId] || "Uncategorized",
            count,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5); 

        const result = {
          period: period.period,
          count: period.count,
          topCategories,
        };

        if (includeRevenue && period.revenue !== undefined) {
          result.revenue = period.revenue;
          result.itemsSold = period.itemsSold || period.count;
        }

        return result;
      });

      const totalCount = processedData.reduce(
        (sum, period) => sum + period.count,
        0
      );

      const totalRevenue = includeRevenue
        ? processedData.reduce((sum, period) => sum + (period.revenue || 0), 0)
        : 0;
        
      const totalItemsSold = includeRevenue
        ? processedData.reduce((sum, period) => sum + (period.itemsSold || 0), 0)
        : 0;

      return {
        data: processedData,
        totalCount,
        ...(includeRevenue ? { 
          totalRevenue,
          totalItemsSold: totalItemsSold > 0 ? totalItemsSold : totalCount
        } : {}),
      };
    };

    const processedSaleData = processCategoryData(saleBooks);
    const processedDonationData = processCategoryData(donatedBooks);
    const processedSoldData = processCategoryData(mergedSoldBooks, true);

    const totalRevenue = await Order.aggregate([
      { 
        $match: { 
          paymentStatus: "paid",
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$netTotal" }
        }
      }
    ]);

    const allPeriods = [
      ...new Set([
        ...saleBooks.map((period) => period.period),
        ...donatedBooks.map((period) => period.period),
        ...mergedSoldBooks.map((period) => period.period),
      ]),
    ].sort();

    const timelineData = allPeriods.map((period) => {
      const saleEntry = saleBooks.find((entry) => entry.period === period);
      const donationEntry = donatedBooks.find(
        (entry) => entry.period === period
      );
      const soldEntry = mergedSoldBooks.find((entry) => entry.period === period);
      const saleData = salesData.find((entry) => entry.period === period);

      return {
        period,
        saleCount: saleEntry ? saleEntry.count : 0,
        donationCount: donationEntry ? donationEntry.count : 0,
        soldCount: soldEntry ? soldEntry.count : 0,
        itemsSold: saleData ? saleData.itemsSold : (soldEntry ? soldEntry.count : 0),
        soldRevenue: saleData ? saleData.totalRevenue : 0,
        totalCount: (saleEntry ? saleEntry.count : 0) + (donationEntry ? donationEntry.count : 0),
      };
    });

    const availableBookCount = await Book.countDocuments({
      status: "available",
    });
    const soldBookCount = await Book.countDocuments({ status: "sold" });
    const pendingBookCount = await Book.countDocuments({ status: "pending" });
    const donatedBookCount = await Book.countDocuments({ 
      $or: [
        { status: "donated" },
        { forDonation: true }
      ]
    });

    res.status(200).json({
      success: true,
      timeframe: {
        startDate: start,
        endDate: end,
        groupBy,
      },
      summary: {
        totalBooks: processedSaleData.totalCount + processedDonationData.totalCount,
        booksForSale: processedSaleData.totalCount,
        booksForDonation: processedDonationData.totalCount,
        booksSold: processedSoldData.totalItemsSold || processedSoldData.totalCount,
        soldRevenue: totalRevenue.length > 0 ? totalRevenue[0].totalRevenue : processedSoldData.totalRevenue,
        ratio:
          processedSaleData.totalCount + processedDonationData.totalCount > 0
            ? (
                processedSaleData.totalCount /
                (processedSaleData.totalCount +
                  processedDonationData.totalCount)
              ).toFixed(2)
            : 0,
        averageRevenuePerBook: 
          processedSoldData.totalItemsSold > 0 
            ? ((totalRevenue.length > 0 ? totalRevenue[0].totalRevenue : processedSoldData.totalRevenue) / 
               processedSoldData.totalItemsSold).toFixed(2)
            : 0,
      },
      inventory: {
        available: availableBookCount,
        sold: soldBookCount,
        donated: donatedBookCount,
        pending: pendingBookCount,
        total:
          availableBookCount +
          soldBookCount +
          donatedBookCount +
          pendingBookCount,
      },
      timeline: timelineData,
      booksForSale: processedSaleData.data,
      booksForDonation: processedDonationData.data,
      booksSold: processedSoldData.data,
      salesOverview: {
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].totalRevenue : 0,
        itemsSold: processedSoldData.totalItemsSold || 0,
        completedOrders: salesData.reduce((sum, period) => sum + period.count, 0),
        periodData: salesData
      }
    });
  } catch (error) {
    console.error("Error generating book activity report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate book activity report",
      error: error.message,
    });
  }
};

module.exports = {
  getUsers,
  approveSeller,
  rejectSeller,
  getApprovedSellers,
  getPlatformFeeReport,
  getSalesPerformanceReport,
  getBookActivityReport,
};
