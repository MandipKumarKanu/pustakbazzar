const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  myProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  addAddress,
  logout,
} = require("../controllers/authController");
const authMiddleWare = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.get("/profile", authMiddleWare, myProfile);
router.get("/users", authMiddleWare, getUsers);
router.get("/user/:id", authMiddleWare, getUserById);
router.put("/profile", authMiddleWare, updateUser);
router.delete("/profile", authMiddleWare, deleteUser);
router.put("/profile/address", authMiddleWare, addAddress);
router.post("/logout", authMiddleWare, logout);

module.exports = router;
