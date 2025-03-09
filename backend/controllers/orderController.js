const Order = require("../models/Order");
const Cart = require("../models/Cart");

/**
 * Create a new order by splitting the user's cart into seller-specific sub-orders.
 */
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { payment = "credit", discount = 0 } = req.body;

    const cart = await Cart.findOne({ userId }).populate("carts.books.bookId");
    if (!cart || !cart.carts || cart.carts.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const orders = cart.carts.map((sellerCart) => {
      const books = sellerCart.books.map((bookItem) => {
        const currentPrice = bookItem.bookId.sellingPrice;
        const sellerEarningRate = 0.8;
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
        deliveryPrice: sellerCart.deliveryPrice,
        status: "pending",
      };
    });

    let totalPrice = 0;
    let totalDeliveryPrice = 0;
    orders.forEach((subOrder) => {
      subOrder.books.forEach((book) => {
        totalPrice += book.price * book.quantity;
      });
      totalDeliveryPrice += subOrder.deliveryPrice;
    });
    const netTotal = totalPrice + totalDeliveryPrice - discount;

    const newOrder = new Order({
      orders,
      userId,
      totalPrice,
      deliveryPrice: totalDeliveryPrice,
      discount,
      netTotal,
      payment,
      orderStatus: "pending",
      paymentStatus: "pending",
    });

    await newOrder.save();

    cart.carts = [];
    await cart.save();

    return res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error in createOrder:", error);
    return res.status(500).json({
      error: "Failed to create order",
      details: error.message,
    });
  }
};

/**
 * Retrieve all orders for the authenticated user.
 */
const getOrdersForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId })
      .populate("orders.sellerId", "profile.userName _id")
      .populate("orders.books.bookId");

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

/**
 * Retrieve orders for the authenticated seller.
 * Only returns sub-orders that belong to the seller.
 */
const getOrdersForSeller = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const orders = await Order.find({ "orders.sellerId": sellerId })
      .select(
        "-totalPrice -deliveryPrice -discount -netTotal -payment -paymentStatus -orderStatus"
      )
      .populate("orders.sellerId", "profile.userName _id")
      .populate("orders.books.bookId")
      // .populate("userId", "profile.userName _id");

    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this seller" });
    }

    const sellerOrders = orders.map((order) => {
      const orderObj = order.toObject();
      orderObj.orders = orderObj.orders.filter(
        (subOrder) => subOrder.sellerId._id.toString() === sellerId.toString()
      );
      return orderObj;
    });

    return res.status(200).json({ orders: sellerOrders });
  } catch (error) {
    console.error("Error in getOrdersForSeller:", error);
    return res.status(500).json({
      error: "Failed to retrieve seller orders",
      details: error.message,
    });
  }
};

/**
 * Retrieve all orders for admin review.
 * This endpoint should be protected by an admin-only middleware.
 */
const getOrdersForAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "profile ")
      .populate("orders.sellerId", "profile isSeller _id")
      .populate("orders.books.bookId");

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Error in getOrdersForAdmin:", error);
    return res.status(500).json({
      error: "Failed to retrieve orders",
      details: error.message,
    });
  }
};

/**
 * Allow a seller to approve or reject their sub-order.
 * The overall order status is updated based on all sub-orders:
 * - All approved => "confirmed"
 * - Some approved => "partially approved"
 * - Otherwise => "pending"
 */
const approveRejectOrder = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    let sellerId = req.user.id;

    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ error: "Invalid status. Must be 'approved' or 'rejected'." });
    }

    const order = await Order.findById(orderId);
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

/**
 * Allow a user to cancel their order if it is still pending or partially approved and not yet paid.
 */
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

module.exports = {
  createOrder,
  getOrdersForUser,
  getOrdersForSeller,
  getOrdersForAdmin,
  approveRejectOrder,
  cancelOrder,
};
