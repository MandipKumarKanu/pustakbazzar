const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Book = require("../models/Book");

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, profile: user.profile, seller: user.isSeller },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15d" }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

const register = async (req, res) => {
  try {
    const { profile, password } = req.body;
    const existingUser = await User.findOne({ "profile.email": profile.email });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use." });

    const user = new User({ profile, password });
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    res.status(201).json({
      message: "User registered successfully.",
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ "profile.email": email });
    if (!user) return res.status(400).json({ message: "Invalid credentials." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials." });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    if (req.user.profile.role !== "admin")
      return res.status(403).json({ message: "Access denied." });
    const users = await User.find().select("-password -refreshToken");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    if (req.user._id !== req.params.id && req.user.profile.role !== "admin") {
      return res.status(403).json({ message: "Access denied." });
    }
    const user = await User.findById(req.params.id).select(
      "-password -refreshToken"
    );
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const myProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -refreshToken"
    );
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const myBook = async (req, res) => {
  try {
    const uid = req.user._id;
    const forDonation = req.params.forDonation === "true" ? true : false;
    const books = await Book.find({ addedBy: uid, forDonation })
    .populate(
      "category",
      "categoryName"
    );
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
    }).select("-password -refreshToken");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// const addAddress = async (req, res) => {
//   try {
//     const { address } = req.body;
//     const user = await User.findByIdAndUpdate(
//       req.user._id,
//       { "profile.address": address },
//       { new: true }
//     );
//     res.status(200).json(user);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.refreshToken = null;
    await user.save();
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken)
      return res.status(401).json({ message: "Unauthorized." });

    const user = await User.findOne({ refreshToken });
    if (!user)
      return res.status(403).json({ message: "Invalid refresh token." });

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err)
          return res.status(403).json({ message: "Invalid refresh token." });
        const newAccessToken = generateAccessToken(user);
        res.status(200).json({ accessToken: newAccessToken });
      }
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const applyForSeller = async (req, res) => {
  try {
    const { proofDoc } = req.body;
    const user = await User.findById(req.user._id);

    if (user.isSeller.status === "approved")
      return res.status(400).json({ message: "You are already a seller." });

    user.isSeller = { status: "applied", proofDoc };
    await user.save();

    res.status(200).json({ message: "Seller application submitted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const approveSeller = async (req, res) => {
  try {
    if (req.user.profile.role !== "admin")
      return res.status(403).json({ message: "Access denied." });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.isSeller.status = "approved";
    await user.save();

    res.status(200).json({ message: "Seller approved." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rejectSeller = async (req, res) => {
  try {
    if (req.user.profile.role !== "admin")
      return res.status(403).json({ message: "Access denied." });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.isSeller.status = "rejected";
    await user.save();

    res.status(200).json({ message: "Seller application rejected." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      firstName,
      lastName,
      street,
      province,
      town,
      landmark,
      phone,
      email,
      isDefault,
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.profile.address.length >= 3) {
      return res
        .status(400)
        .json({ message: "You can only add up to 3 addresses." });
    }
    const newAddress = {
      firstName,
      lastName,
      street,
      province,
      town,
      landmark,
      phone,
      email,
      isDefault: isDefault || false,
    };

    user.profile.address.push(newAddress);

    await user.save();

    res.status(201).json({ message: "Address added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("profile.address");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ addresses: user.profile.address });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  getUsers,
  getUserById,
  myProfile,
  updateUser,
  deleteUser,
  addAddress,
  logout,
  refreshToken,
  approveSeller,
  applyForSeller,
  rejectSeller,
  myBook,
  getUserAddresses,
};
