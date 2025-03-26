const Transaction = require("../models/Transaction");
const Order = require("../models/Order");
const Book = require("../models/Book");
const User = require("../models/User");
const { khaltiRequest } = require("../utils/khaltiRequest");

const platformFeePercentage = 0.2;

const initiateTransaction = async (req, res) => {
  try {
    const { orderId, amount } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (order.paymentStatus !== "pending") {
      return res.status(400).json({ error: "Order cannot be paid" });
    }

    // Update seller earnings for each seller sub-order
    order.orders.forEach((sellerOrder) => {
      sellerOrder.books.forEach((book) => {
        // Calculate earnings after deducting the platform fee
        const sellerEarnings = book.price * (1 - platformFeePercentage);
        book.sellerEarnings = sellerEarnings;
      });
    });
    await order.save();

    // Prepare payload for Khalti API; note the amount conversion if required by Khalti (e.g. to paisa)
    const payload = {
      return_url: `${process.env.FRONTEND_URL}/payment/verify`,
      amount: amount * 100, // converting to smallest currency unit if necessary
      purchase_order_id: orderId,
      purchase_order_name: "Book Purchase",
      customer_info: { userId: order.userId },
    };

    const khaltiResponse = await khaltiRequest("initiate/", payload);

    // Save transaction record
    const transaction = new Transaction({
      orderId,
      amount,
      khaltiPaymentId: khaltiResponse.idx,
    });
    await transaction.save();

    // Update order with Khalti payment id
    order.khaltiPaymentId = khaltiResponse.idx;
    order.paymentStatus = "pending";
    await order.save();

    // Return the Khalti response (which typically includes a payment URL and idx)
    res.json(khaltiResponse);
  } catch (error) {
    console.error("Transaction initiation error:", error.message);
    res
      .status(500)
      .json({ error: "Transaction initiation failed", details: error.message });
  }
};

const verifyTransaction = async (req, res) => {
  try {
    // Extract the Khalti payment id from the request body
    const { pidx } = req.body;
    if (!pidx) {
      return res.status(400).json({ error: "Payment ID (pidx) is required" });
    }

    // Call Khalti's lookup API to retrieve payment details for this pidx
    const data = await khaltiRequest("lookup/", { pidx });

    // Find the corresponding transaction record by Khalti payment id
    const transaction = await Transaction.findOne({ khaltiPaymentId: pidx });
    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    // Retrieve the order associated with this transaction
    const order = await Order.findById(transaction.orderId);

    // Update order's payment status based on the Khalti response.
    // If the status is "Completed", mark as "paid", otherwise mark as "cancelled"
    order.paymentStatus = data.status === "Completed" ? "paid" : "cancelled";
    await order.save();

    // Update the transaction record with detailed payment information from Khalti
    transaction.status = data.status === "Completed" ? "completed" : "failed";
    transaction.paymentDetails = data;
    await transaction.save();

    // If payment is successful, update each seller's balance and book status
    if (data.status === "Completed") {
      for (const sellerOrder of order.orders) {
        // For each seller sub-order, update seller balance and book status
        for (const book of sellerOrder.books) {
          // Update seller balance
          const seller = await User.findById(sellerOrder.sellerId);
          if (seller) {
            seller.balance += book.sellerEarnings;
            await seller.save();
          }

          // Update book status to "sold"
          const bookToUpdate = await Book.findById(book.bookId);
          if (bookToUpdate) {
            bookToUpdate.status = "sold";
            await bookToUpdate.save();
          }
        }
      }
    }

    // Respond with the Khalti lookup data (payment details)
    res.json(data);
  } catch (error) {
    console.error("Transaction verification error:", error.message);
    res.status(500).json({
      error: "Transaction verification failed",
      details: error.message,
    });
  }
};

module.exports = {
  initiateTransaction,
  verifyTransaction,
};
