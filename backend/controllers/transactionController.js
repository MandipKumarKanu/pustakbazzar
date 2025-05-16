const Transaction = require("../models/Transaction");
const Order = require("../models/Order");
const Book = require("../models/Book");
const User = require("../models/User");
// const axios = require("axios");
const { validationResult } = require("express-validator");
const { khaltiRequest } = require("../utils/khaltiRequest");
const {
  recordSale,
  recordDonation,
  recordBookAdded,
  recordUserSignup,
  recordVisit,
} = require("./statsController");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const {
  calculatePlatformFee,
  recordPlatformFee,
} = require("../services/platformFeeService");

const generatePID = () => {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
};

const processTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId, amount } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (order.paymentStatus !== "pending") {
      return res.status(400).json({ error: "Order cannot be paid" });
    }

    for (const sellerOrder of order.orders) {
      for (const book of sellerOrder.books) {
        const { feePercentage, platformFee, sellerEarnings } =
          calculatePlatformFee(book.price, book.quantity);
        book.platformFeePercentage = feePercentage;
        book.platformFee = platformFee;
        book.sellerEarnings = sellerEarnings;
      }
    }
    await order.save();

    const payload = {
      return_url: `${process.env.FRONTEND_URL}/payment/verify`,
      amount: amount * 100,
      purchase_order_id: orderId,
      purchase_order_name: "Book Purchase",
      customer_info: { userId: order.userId },
    };

    const khaltiResponse = await khaltiRequest("initiate/", payload);

    const transaction = new Transaction({
      orderId,
      amount,
      khaltiPaymentId: khaltiResponse.idx,
    });
    await transaction.save();

    order.khaltiPaymentId = khaltiResponse.idx;
    order.paymentStatus = "pending";
    await order.save();

    res.json(khaltiResponse);
  } catch (error) {
    console.error("Transaction initiation error:", error.message);
    res
      .status(500)
      .json({ error: "Transaction initiation failed", details: error.message });
  }
};

const verifyKhaltiPayment = async (req, res) => {
  try {
    const { pidx } = req.body;
    if (!pidx) {
      return res.status(400).json({ error: "Payment ID (pidx) is required" });
    }

    const data = await khaltiRequest("lookup/", { pidx });

    const transaction = await Transaction.findOne({ khaltiPaymentId: pidx });
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    const order = await Order.findById(transaction.orderId);

    if (data.status === "Completed" && transaction.status !== "completed") {
      await recordSale(order.netTotal);

      const user = await User.findById(order.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      for (const sellerOrder of order.orders) {
        for (const book of sellerOrder.books) {
          const seller = await User.findById(sellerOrder.sellerId);
          if (seller) {
            const { sellerEarnings, platformFee } = calculatePlatformFee(
              book.price,
              book.quantity
            );

            seller.balance += sellerEarnings;
            await seller.save();

            await recordPlatformFee(
              transaction._id,
              order._id,
              platformFee,
              sellerOrder.sellerId
            );
          }

          if (!user.bought.includes(book.bookId.toString())) {
            user.bought.push(book.bookId);
          }

          const bookToUpdate = await Book.findById(book.bookId);
          if (bookToUpdate) {
            bookToUpdate.status = "sold";
            await bookToUpdate.save();
          }
        }
      }

      await user.save();
    }

    order.paymentStatus = data.status === "Completed" ? "paid" : "cancelled";
    await order.save();

    transaction.status = data.status === "Completed" ? "completed" : "failed";
    transaction.paymentDetails = data;
    await transaction.save();

    res.json(data);
  } catch (error) {
    console.error("Transaction verification error:", error.message);
    res.status(500).json({
      error: "Transaction verification failed",
      details: error.message,
    });
  }
};

const handleStripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const transaction = await Transaction.findOne({
      stripeSessionId: session.id,
    });

    if (transaction && transaction.status !== "completed") {
      transaction.status = "completed";
      await transaction.save();

      const order = await Order.findById(transaction.orderId).populate(
        "orders.sellerId"
      );

      await recordSale(order.netTotal);

      order.status = "confirmed";
      await order.save();

      for (const sellerOrder of order.orders) {
        for (const book of sellerOrder.books) {
          const { sellerEarnings, platformFee } = calculatePlatformFee(
            book.price,
            book.quantity
          );

          const seller = await User.findById(sellerOrder.sellerId);
          if (seller) {
            seller.balance += sellerEarnings;
            await seller.save();

            await recordPlatformFee(
              transaction._id,
              order._id,
              platformFee,
              sellerOrder.sellerId
            );
          }
        }
      }
    }
  }

  return res.status(200).json({ received: true });
};

module.exports = {
  processTransaction,
  verifyKhaltiPayment,
  handleStripeWebhook,
};
