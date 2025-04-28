const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Book = require("../models/Book");
const { khaltiRequest } = require("../utils/khaltiRequest");
const Transaction = require("../models/Transaction");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      payment = "credit",
      discount = 0,
      shippingFee,
      shippingAddress,
    } = req.body;

    const cart = await Cart.findOne({ userId }).populate("carts.books.bookId");
    if (!cart || !cart.carts || cart.carts.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const orders = cart.carts.map((sellerCart) => {
      const books = sellerCart.books.map((bookItem) => {
        const currentPrice = bookItem.bookId.sellingPrice;
        const sellerEarningRate = 1;
        return {
          bookId: bookItem.bookId._id,
          price: currentPrice,
          quantity: bookItem.quantity,
          sellerEarnings: currentPrice * sellerEarningRate * bookItem.quantity,
        };
      });

      return {
        sellerId: sellerCart.sellerId,
        books,
        shippingFee,
        status: "pending",
      };
    });

    let totalPrice = 0;
    orders.forEach((subOrder) => {
      subOrder.books.forEach((book) => {
        totalPrice += book.price * book.quantity;
      });
    });
    const netTotal = totalPrice + +shippingFee - discount;

    const newOrder = new Order({
      orders,
      userId,
      totalPrice,
      shippingFee,
      discount,
      netTotal,
      payment,
      orderStatus: "pending",
      paymentStatus: "pending",
      shippingAddress,
    });
    await newOrder.save();

    cart.carts = [];
    await cart.save();

    if (payment === "khalti") {
      const payload = {
        return_url: `${process.env.FRONTEND_URL}/payment/verify`,
        website_url: process.env.FRONTEND_URL,
        amount: netTotal * 100,
        purchase_order_id: newOrder._id,
        purchase_order_name: "Book Purchase",
        customer_info: {
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          email: shippingAddress.email,
          phone: "9811209589",
        },
      };

      const khaltiResponse = await khaltiRequest("initiate/", payload);

      newOrder.khaltiPaymentId = khaltiResponse.pidx;
      newOrder.paymentStatus = "pending";
      await newOrder.save();

      const transaction = new Transaction({
        orderId: newOrder._id,
        amount: netTotal,
        khaltiPaymentId: khaltiResponse.pidx,
        khaltiResponse,
      });
      await transaction.save();

      return res.status(201).json({
        message: "Order created and Khalti transaction initiated successfully",
        order: newOrder,
        khaltiResponse,
      });
    } else {
      return res.status(201).json({
        message: "Order created successfully",
        order: newOrder,
      });
    }
  } catch (error) {
    console.error("Error in createOrder:", error);
    return res.status(500).json({
      error: "Failed to create order",
      details: error.message,
    });
  }
};

const createOrderWithStripe = async (req, res) => {
  try {
    const {
      shippingAddress,
      shippingFee = 0,
      products,
      discount = 0,
    } = req.body;
    const userId = req.user.id;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "No products provided" });
    }

    let totalPrice = 0;
    const orders = [];

    // Prepare orders
    for (const sellerCart of products) {
      const { sellerId, books } = sellerCart;

      const orderBooks = books.map((book) => {
        const price =
          book.price || book.currentPrice || book.bookId.sellingPrice;
        const sellerEarningRate = 1; // Adjust if needed

        totalPrice += price * book.quantity;

        return {
          bookId: book.bookId._id,
          price,
          quantity: book.quantity,
          sellerEarnings: price * sellerEarningRate * book.quantity,
        };
      });

      orders.push({
        sellerId: sellerId._id || sellerId,
        books: orderBooks,
        shippingFee,
        status: "pending",
      });
    }

    const netTotal = totalPrice + Number(shippingFee) - Number(discount);

    const newOrder = new Order({
      orders,
      userId,
      totalPrice,
      shippingFee,
      discount,
      netTotal,
      payment: "stripe",
      orderStatus: "pending",
      paymentStatus: "pending",
      shippingAddress,
    });
    await newOrder.save();

    const lineItems = products.flatMap((seller) =>
      seller.books.map((book) => {
        const price =
          book.price || book.currentPrice || book.bookId.sellingPrice;

        return {
          price_data: {
            currency: "npr",
            product_data: {
              name: book.bookId.title,
              images: [book.bookId.images[0]],
              metadata: {
                book_id: book.bookId._id.toString(),
              },
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: book.quantity,
        };
      })
    );

    if (shippingFee > 0) {
      lineItems.push({
        price_data: {
          currency: "npr",
          product_data: {
            name: "Shipping Fee",
            description: "Delivery charges",
          },
          unit_amount: Math.round(shippingFee * 100),
        },
        quantity: 1,
      });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      client_reference_id: newOrder._id.toString(),
      metadata: {
        order_id: newOrder._id.toString(),
        user_id: userId,
      },
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&order_id=${newOrder._id}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel?order_id=${newOrder._id}`,
    });

    newOrder.stripeSessionId = session.id;
    await newOrder.save();



    await Cart.findOneAndUpdate(
      { userId },
      { $set: { carts: [] } }
    );

    const transaction = new Transaction({
      orderId: newOrder._id,
      amount: netTotal,
      status: "initiated",
      stripeSessionId: session.id,
      paymentMethod: "stripe",
      paymentDetails: {
        sessionId: session.id,
        amount: netTotal,
        currency: "npr",
      },
    });
    await transaction.save();

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      sessionId: session.id,
      orderId: newOrder._id,
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error("Stripe order creation error:", error.stack || error.message);
    return res.status(500).json({
      error: "Failed to create order with Stripe",
      details: error.message,
    });
  }
};

const getOrdersForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId })
      .populate("orders.sellerId", "profile.userName _id")
      .populate("orders.books.bookId")
      .sort({ date: -1 })
      .lean();

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Error in getOrdersForUser:", error);
    return res.status(500).json({
      error: "Failed to retrieve orders",
      details: error.message,
    });
  }
};

const getOrdersForSeller = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = { "orders.sellerId": sellerId };

    if (
      status &&
      ["pending", "approved", "rejected", "completed"].includes(status)
    ) {
      query["orders.status"] = status;
    }

    const orders = await Order.find(query)
      .select(
        "-totalPrice -deliveryPrice -discount -netTotal -payment -paymentStatus -orderStatus"
      )
      .populate("orders.sellerId", "profile.userName _id")
      .populate("orders.books.bookId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalOrders = await Order.countDocuments(query);

    if (!orders || orders.length === 0) {
      return res.status(200).json({
        message: "No orders found for this seller",
        orders: [],
        pagination: {
          totalOrders: 0,
          totalPages: 0,
          currentPage: pageNum,
        },
      });
    }

    const sellerOrders = orders.map((order) => {
      const orderObj = order.toObject();
      orderObj.orders = orderObj.orders.filter(
        (subOrder) => subOrder.sellerId._id.toString() === sellerId.toString()
      );
      return orderObj;
    });

    return res.status(200).json({
      orders: sellerOrders,
      pagination: {
        totalOrders,
        totalPages: Math.ceil(totalOrders / limitNum),
        currentPage: pageNum,
      },
    });
  } catch (error) {
    console.error("Error in getOrdersForSeller:", error);
    return res.status(500).json({
      error: "Failed to retrieve seller orders",
      details: error.message,
    });
  }
};

const getOrdersForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    if (
      status &&
      [
        "approved",
        "rejected",
        "completed",
        "cancelled",
        "confirmed",
        "shipped",
        "delivered",
      ].includes(status)
    ) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate("userId", "profile")
      .populate("orders.sellerId", "profile isSeller _id")
      .populate("orders.books.bookId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalOrders = await Order.countDocuments(query);

    if (!orders || orders.length === 0) {
      return res.status(200).json({
        message: "No orders found",
        orders: [],
        pagination: {
          totalOrders: 0,
          totalPages: 0,
          currentPage: pageNum,
        },
      });
    }

    return res.status(200).json({
      orders,
      pagination: {
        totalOrders,
        totalPages: Math.ceil(totalOrders / limitNum),
        currentPage: pageNum,
      },
    });
  } catch (error) {
    console.error("Error in getOrdersForAdmin:", error);
    return res.status(500).json({
      error: "Failed to retrieve orders",
      details: error.message,
    });
  }
};

const approveRejectOrder = async (req, res) => {
  try {
    const { orderId, status, message } = req.body;
    const sellerId = req.user.id;

    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ error: "Invalid status. Must be 'approved' or 'rejected'." });
    }

    const order = await Order.findById(orderId).populate("orders.books.bookId");
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const sellerSubOrder = order.orders.find(
      (subOrder) => subOrder.sellerId.toString() === sellerId.toString()
    );
    if (!sellerSubOrder) {
      return res
        .status(403)
        .json({ error: "Seller is not associated with this order." });
    }

    sellerSubOrder.status = status;

    if (status === "rejected") {
      order.orderStatus = "cancelled by seller";
      order.cancellationMessage =
        message || "Order was cancelled by one of the sellers.";

      const bookUpdatePromises = order.orders.flatMap((subOrder) =>
        subOrder.books.map(async (bookItem) => {
          const book = await Book.findById(bookItem.bookId._id);
          if (book) {
            book.status = "available";
            await book.save();
          }
        })
      );
      await Promise.all(bookUpdatePromises);

      order.orders.forEach((subOrder) => {
        subOrder.status = "rejected";
      });

      await order.save();

      return res.status(200).json({
        message:
          "Order has been cancelled by the seller. All books are now available.",
        order,
      });
    }

    const allApproved = order.orders.every(
      (subOrder) => subOrder.status === "approved"
    );
    const anyApproved = order.orders.some(
      (subOrder) => subOrder.status === "approved"
    );

    order.orderStatus = allApproved
      ? "confirmed"
      : anyApproved
      ? "partially approved"
      : "pending";

    await order.save();

    return res.status(200).json({
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error("Error in approveRejectOrder:", error);
    return res.status(500).json({
      error: "Failed to update order",
      details: error.message,
    });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "You are not authorized to cancel this order." });
    }

    if (!["pending", "partially approved"].includes(order.orderStatus)) {
      return res.status(400).json({
        error: "Only pending or partially approved orders can be cancelled.",
      });
    }
    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        error:
          "Paid orders cannot be cancelled directly. Please contact support.",
      });
    }

    order.orderStatus = "cancelled";
    await order.save();

    return res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Error in cancelOrder:", error);
    return res.status(500).json({
      error: "Failed to cancel order",
      details: error.message,
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    order.orderStatus = status;
    await order.save();

    res
      .status(200)
      .json({ message: "Order status updated successfully.", order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      message: "Failed to update order status.",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  createOrderWithStripe,
  getOrdersForUser,
  getOrdersForSeller,
  getOrdersForAdmin,
  approveRejectOrder,
  cancelOrder,
  updateOrderStatus,
};
