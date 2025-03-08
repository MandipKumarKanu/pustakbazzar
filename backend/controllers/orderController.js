const Order = require("../models/Order");
const Book = require("../models/Book");
const User = require("../models/User");

const createOrder = async (req, res) => {
  try {
    const { orders, userId, discount = 0 } = req.body;

    if (!orders || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let totalPrice = 0;
    let totalDeliveryPrice = 0;

    orders.forEach((sellerOrder) => {
      sellerOrder.books.forEach((book) => {
        totalPrice += book.price;
      });
      totalDeliveryPrice += sellerOrder.deliveryPrice;
    });

    const netTotal = totalPrice + totalDeliveryPrice - discount;

    const newOrder = new Order({
      orders,
      userId,
      totalPrice,
      deliveryPrice: totalDeliveryPrice,
      discount,
      netTotal,
    });

    await newOrder.save();

    res
      .status(201)
      .json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

const getOrdersForUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ userId })
      .populate("orders.sellerId")
      .populate("orders.books.bookId");

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.json({ orders });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

const approveRejectOrder = async (req, res) => {
  try {
    const { orderId, sellerId, status } = req.body; 

    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ error: "Invalid status, must be 'approved' or 'rejected'" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const sellerOrder = order.orders.find(
      (order) => order.sellerId.toString() === sellerId.toString()
    );
    if (!sellerOrder) {
      return res
        .status(403)
        .json({ error: "Seller not associated with this order" });
    }

    sellerOrder.status = status;

    const allApproved = order.orders.every(
      (order) => order.status === "approved"
    );

    if (allApproved) {
      order.orderStatus = "confirmed"; 
    }

    await order.save();

    res.json({ message: "Order updated successfully", order });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
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
        .json({ error: "You can only cancel your own orders" });
    }

    if (order.orderStatus !== "pending") {
      return res
        .status(400)
        .json({ error: "You can only cancel pending orders" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({
        error:
          "Paid orders cannot be cancelled directly. Please contact support.",
      });
    }

    order.orderStatus = "cancelled";
    await order.save();

    res.json({ message: "Order cancelled successfully", order });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createOrder,
  getOrdersForUser,
  approveRejectOrder,
  cancelOrder,
};
