const User = require("../models/User");

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

    const averageFeePerTransaction = totalTransactions > 0
      ? report.reduce((sum, period) => sum + period.totalFees, 0) / totalTransactions
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
        { createdAt: { $gte: start, $lte: end } }
      ],
      paymentStatus: "paid"
    })
    .populate('orders.books.bookId')
    .populate('userId', 'profile.userName')
    .lean();

    orders.forEach(order => {
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
      console.log('No paid orders found within the specified date range.');
      
      return res.status(200).json({
        success: true,
        data: {
          timeframe: {
            startDate: start,
            endDate: end,
            groupBy: group || 'monthly'
          },
          summary: {
            totalOrders: 0,
            totalRevenue: 0,
            totalItemsSold: 0,
            averageOrderValue: 0
          },
          timeSeriesData: [],
          categoryPerformance: [],
          message: "No orders found for the specified date range"
        }
      });
    }

    const groupByTime = (orders, groupType) => {
      return orders.reduce((acc, order) => {
        let key;
        
        let date;
        try {
          date = new Date(order.createdAt || order.date);

          if (isNaN(date.getTime())) {
            console.log(`Invalid date found in order ${order._id}, using current date`);
            date = new Date();
          }
        } catch (err) {
          console.log(`Error processing date for order ${order._id}: ${err.message}`);
          date = new Date();
        }
        
        switch(groupType) {
          case 'daily':
            key = date.toISOString().split('T')[0]; 
            break;
          case 'weekly':
            const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
            const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
            const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
            key = `${date.getFullYear()}-W${weekNum}`;
            break;
          case 'monthly':
          default:
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }
        
        if (!acc[key]) {
          acc[key] = {
            period: key,
            orderCount: 0,
            totalRevenue: 0,
            itemsSold: 0,
            orders: []
          };
        }
        
        const allBooks = order.orders?.flatMap(subOrder => subOrder.books) || [];
        
        const orderTotal = order.netTotal || 0;
        const itemCount = allBooks.reduce((sum, book) => sum + (book.quantity || 0), 0);
        
        acc[key].orderCount++;
        acc[key].totalRevenue += orderTotal;
        acc[key].itemsSold += itemCount;
        acc[key].orders.push({
          id: order._id,
          customer: order.userId?.profile?.userName || 'Unknown',
          total: orderTotal,
          status: order.orderStatus,
          items: itemCount
        });
        
        return acc;
      }, {});
    };

    const groupBy = group || 'monthly';
    const timeGroupedData = groupByTime(orders, groupBy);
    
    const timeSeriesData = Object.values(timeGroupedData).sort((a, b) => 
      a.period.localeCompare(b.period)
    );

    const categoryPerformance = orders.reduce((acc, order) => {
      order.orders?.forEach(subOrder => {
        subOrder.books?.forEach(book => {
          if (!book.bookId) return;
          
          const category = book.bookId.category || 'Uncategorized';
          if (!acc[category]) {
            acc[category] = {
              category,
              itemsSold: 0,
              revenue: 0
            };
          }
          
          acc[category].itemsSold += book.quantity || 0;
          acc[category].revenue += (book.price || 0) * (book.quantity || 0);
        });
      });
      
      return acc;
    }, {});

    const categoryData = Object.values(categoryPerformance).sort((a, b) => 
      b.revenue - a.revenue
    );

    const totalRevenue = orders.reduce((sum, order) => sum + (order.netTotal || 0), 0);
    
    const totalItemsSold = orders.reduce((sum, order) => {
      const bookCount = order.orders?.reduce((subSum, subOrder) => {
        return subSum + subOrder.books?.reduce((bookSum, book) => 
          bookSum + (book.quantity || 0), 0) || 0;
      }, 0) || 0;
      
      return sum + bookCount;
    }, 0);
    
    const averageOrderValue = orders.length > 0 
      ? totalRevenue / orders.length 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        timeframe: {
          startDate: start,
          endDate: end,
          groupBy
        },
        summary: {
          totalOrders: orders.length,
          totalRevenue,
          totalItemsSold,
          averageOrderValue
        },
        timeSeriesData,
        categoryPerformance: categoryData,
        debug: {
          usingSampleData,
          totalOrdersInDb,
          queryDateRange: {
            start: start.toISOString(),
            end: end.toISOString()
          }
        }
      }
    });
  } catch (error) {
    console.error("Error generating sales performance report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate sales performance report",
      error: error.message
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
};
