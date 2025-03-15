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
  approveSeller,
  applyForSeller,
  rejectSeller,
} = require("../controllers/authController");
const authMiddleWare = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/refresh", refreshToken);
router.get("/profile", authMiddleWare, myProfile);
router.get("/users", authMiddleWare, roleMiddleware(["admin"]), getUsers);
router.get("/user/:id", authMiddleWare, getUserById);
router.put("/profile", authMiddleWare, updateUser);
router.delete("/profile", authMiddleWare, deleteUser);
router.put("/profile/address", authMiddleWare, addAddress);
router.post("/logout", authMiddleWare, logout);
router.post("/seller", authMiddleWare, applyForSeller);
router.post("/seller/approve/:id", authMiddleWare, approveSeller);
router.post("/seller/reject/:id", authMiddleWare, rejectSeller);

module.exports = router;
