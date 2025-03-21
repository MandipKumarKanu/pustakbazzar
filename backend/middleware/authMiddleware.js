const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleWare = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.find({
      "profile.userName": decoded.profile.userName,
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    req.user = user[0];
    next();
  } catch (error) {
    return res.status(401).json({
      error: error.message,
    });
  }
};

module.exports = authMiddleWare;
