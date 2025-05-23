require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const categoryRoutes = require("./routes/categoryRoutes");
const payoutRouter = require("./routes/payoutRoute");
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const saveForLaterRoutes = require("./routes/saveForLaterRoutes");
const cartRoute = require("./routes/cartRoute");
const orderRoutes = require("./routes/orderRoutes");
const donationRoutes = require("./routes/donationRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const contactRoutes = require("./routes/contactRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const chatRoutes = require("./routes/chatRoutes");

const http = require('http'); // Added
const { Server } = require("socket.io"); // Added

const app = express();
const server = http.createServer(app); // Added

// Socket.IO CORS configuration
const io = new Server(server, { // Added
  cors: {
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "https://pustakbazzar-h74q.vercel.app",
      "https://pustakbazzar.mandipkk.com.np",
      "http://192.168.100.236:5173",
      "http://192.168.100.64:5173",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

connectDB();
app.set('io', io); // Make io accessible in controllers

// In-memory store for user sockets: { userId: socketId }
const userSockets = {}; // This will store userId -> socketId
app.set('userSockets', userSockets); // Make userSockets accessible in controllers

const socketUserMap = new Map(); // socket.id -> userId mapping for quick lookup on disconnect


io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // User joins with their ID
  socket.on('join', (userId) => {
    if (!userId) {
        console.log(`Socket ${socket.id} tried to join without a userId.`);
        return;
    }
    console.log(`User ${userId} joined with socket ${socket.id}`);
    userSockets[userId] = socket.id;
    socketUserMap.set(socket.id, userId);
    socket.join(userId); // Join a room identified by userId
  });

  // Handle typing events
  socket.on('typing', ({ receiverId, senderId }) => {
    if (receiverId && userSockets[receiverId]) {
      io.to(userSockets[receiverId]).emit('typing', { senderId });
    }
  });

  socket.on('stopTyping', ({ receiverId, senderId }) => {
    if (receiverId && userSockets[receiverId]) {
      io.to(userSockets[receiverId]).emit('stopTyping', { senderId });
    }
  });
  
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    const userId = socketUserMap.get(socket.id);
    if (userId && userSockets[userId] === socket.id) { // Ensure it's the same socket if user reconnected quickly
      delete userSockets[userId];
      console.log(`User ${userId} removed from userSockets`);
    }
    socketUserMap.delete(socket.id);
  });
});

app.post(
  "/api/webhook/stripe",
  express.raw({ type: "application/json" }),
  require("./controllers/transactionController").handleStripeWebhook
);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:5173",
      "https://pustakbazzar-h74q.vercel.app",
      "https://pustakbazzar.mandipkk.com.np",
      "http://192.168.100.236:5173",
      "http://192.168.100.64:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  next();
});


app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/book", bookRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/save", saveForLaterRoutes);
app.use("/api/payouts", payoutRouter);
app.use("/api/cart", cartRoute);
app.use("/api/order", orderRoutes);
app.use("/api/donation", donationRoutes);
app.use("/api/khaltipay", transactionRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 8000;

// Start the server
server.listen(PORT, () => { // Changed app.listen to server.listen
  console.log(`Server running on port ${PORT}`);
});
