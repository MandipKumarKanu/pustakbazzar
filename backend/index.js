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

const app = express();

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [process.env.CLIENT_URL || "http://localhost:5173"],
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/book", bookRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/save", saveForLaterRoutes);
app.use("/api/payouts", payoutRouter);
app.use("/api/cart", cartRoute);
app.use("/api/order", orderRoutes);
app.use("/api/donation", donationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
