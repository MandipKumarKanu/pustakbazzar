const Transaction = require("../models/Transaction");
const Order = require("../models/Order");
const Book = require("../models/Book");
const User = require("../models/User");
const { khaltiRequest } = require("../utils/khaltiRequest");
const { recordSale } = require("../controllers/statsController");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


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

    order.orders.forEach((sellerOrder) => {
      sellerOrder.books.forEach((book) => {
        const sellerEarnings = book.price * (1 - platformFeePercentage);
        book.sellerEarnings = sellerEarnings;
      });
    });
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

const verifyTransaction = async (req, res) => {
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
            seller.balance += book.sellerEarnings;
            await seller.save();
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
  const sig = req.headers['stripe-signature'];
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
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    try {
      const order = await Order.findOne({ stripeSessionId: session.id });
      
      if (!order) {
        console.error(`No order found with session ID: ${session.id}`);
        return res.json({ received: true });
      }
      
      order.paymentStatus = "paid";
      
      const allApproved = order.orders.every(subOrder => subOrder.status === "approved");
      if (allApproved) {
        order.orderStatus = "confirmed";
      }
      
      await order.save();
      
      await recordSale(order.netTotal);
      
      await Transaction.updateOne(
        { stripeSessionId: session.id },
        { $set: { status: "completed" } }
      );
      
      const user = await User.findById(order.userId);
      if (!user) {
        console.error(`User not found with ID: ${order.userId}`);
        return res.json({ received: true });
      }
      
      for (const sellerOrder of order.orders) {
        for (const book of sellerOrder.books) {
          const seller = await User.findById(sellerOrder.sellerId);
          if (seller) {
            seller.balance += book.sellerEarnings;
            await seller.save();
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
    } catch (error) {
      console.error("Error processing Stripe webhook:", error);
    }
  }
  
  // Handle failed payments
  else if (event.type === 'checkout.session.expired' || 
          event.type === 'payment_intent.payment_failed') {
    try {
      const session = event.data.object;
      const sessionId = session.id;
      
      // Find the order and mark it as failed
      const order = await Order.findOne({ 
        stripeSessionId: sessionId 
      });
      
      if (order) {
        order.paymentStatus = "failed";
        await order.save();
        
        // Update transaction
        await Transaction.updateOne(
          { stripeSessionId: sessionId },
          { 
            $set: { 
              status: "failed",
              paymentDetails: {
                error: "Payment failed or expired",
                failedAt: new Date()
              }
            } 
          }
        );
      }
    } catch (error) {
      console.error("Error processing failed payment:", error);
    }
  }
  
  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
};

module.exports = {
  initiateTransaction,
  verifyTransaction,
  handleStripeWebhook,
};
