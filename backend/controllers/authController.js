const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Book = require('../models/Book');
const { recordUserSignup } = require('../controllers/statsController');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const info = await transporter.sendMail({
      from: `"PustakBazzar" <${process.env.EMAIL_SENDER}>`,
      to: to,
      subject: subject,
      html: htmlContent,
    });

    console.log(`Email sent successfully to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    return false;
  }
};

const generateOTP = () => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let otp = '';
  for (let i = 0; i < 6; i++) {
    otp += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return otp;
};

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      profile: user.profile,
      isSeller: user.isSeller,
      interest: user.interest,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });
};

const register = async (req, res) => {
  try {
    const { profile, password } = req.body;
    const existingUser = await User.findOne({ 'profile.email': profile.email });
    if (existingUser)
      return res.status(400).json({ message: 'Email already in use.' });

    const user = new User({ profile, password });
    await user.save();
    await recordUserSignup();

    const welcomeHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${
            user.profile.profileImg ||
            'https://via.placeholder.com/80x80/007bff/ffffff?text=PB'
          }" 
               alt="Profile" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;">
        </div>
        <h2 style="color: #333; text-align: center;">Welcome to PustakBazzar!</h2>
        <p>Hello ${user.profile.firstName} ${user.profile.lastName},</p>
        <p>Welcome to PustakBazzar! Your account has been successfully created.</p>
        <p>You can now browse and purchase books from our vast collection.</p>
        <p>Happy reading!</p>
        <p>Best regards,<br>PustakBazzar Team</p>
      </div>
    `;

    await sendEmail(
      user.profile.email,
      'Welcome to PustakBazzar!',
      welcomeHtml
    );

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'lax',
    });

    res.status(201).json({
      message: 'User registered successfully.',
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ 'profile.email': email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials.' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'lax',
    });

    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    if (req.user._id !== req.params.id && req.user.profile.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied.' });
    }
    const user = await User.findById(req.params.id).select(
      '-password -refreshToken'
    );
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const myProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      '-password -refreshToken'
    );
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const myBook = async (req, res) => {
  try {
    const uid = req.user._id;
    const forDonation = req.params.forDonation === 'true' ? true : false;
    const books = await Book.find({ addedBy: uid, forDonation })
      .sort({ createdAt: -1 })
      .populate('category', 'categoryName');
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  const { firstName, lastName, profileImg } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(firstName && { 'profile.firstName': firstName }),
        ...{ 'profile.lastName': lastName },
        ...(profileImg && { 'profile.profileImg': profileImg }),
      },
      { new: true, runValidators: true }
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.status(200).json({ message: 'User deleted successfully.' });
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
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.profile.address.length >= 3) {
      return res
        .status(400)
        .json({ message: 'You can only add up to 3 addresses.' });
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

    res.status(201).json({ message: 'Address added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.refreshToken = null;
    await user.save();
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  try {
    const user = await User.findOne({ refreshToken });
    if (!user) return res.status(403).json({ message: 'Forbidden' });

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      async (err, decoded) => {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            return res
              .status(403)
              .json({ message: 'Refresh token expired. Please log in again.' });
          }
          return res.status(403).json({ message: 'Invalid refresh token' });
        }

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000,
          sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'lax',
        });

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

    if (user.isSeller.status === 'approved')
      return res.status(400).json({ message: 'You are already a seller.' });

    user.isSeller = { status: 'applied', proofDoc };
    await user.save();

    res.status(200).json({ message: 'Seller application submitted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('profile.address');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ addresses: user.profile.address });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;

    let user = await User.findOne({ 'profile.email': email });

    if (!user) {
      const nameParts = name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      user = new User({
        profile: {
          firstName,
          lastName,
          email,
          profileImg: picture,
          userName: email.split('@')[0],
          role: 'user',
        },
        password: await bcrypt.hash(sub + process.env.PASSWORD_SALT, 10),
        googleId: sub,
        authProvider: 'google',
      });

      await user.save();
      await recordUserSignup();
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'lax',
    });

    res.status(200).json({
      accessToken,
      message: 'Google login successful',
    });
  } catch (error) {
    console.error('Google login error:', error);
    res
      .status(401)
      .json({ message: 'Google authentication failed', error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ 'profile.email': email });
    if (!user) {
      return res.status(200).json({
        message:
          'If your email exists in our system, you will receive a reset code.',
      });
    }

    const otp = generateOTP();

    user.resetPasswordOTP = {
      code: otp,
      expiry: new Date(Date.now() + 15 * 60 * 1000),
      attempts: 0,
      verified: false,
    };

    await user.save();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
        <h2 style="color: #333;">Password Reset Code</h2>
        <p>Hello ${user.profile.firstName} ${user.profile.lastName},</p>
        <p>You've requested to reset your password. Please use the following code to verify your identity:</p>
        <div style="background-color: #f7f7f7; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        <p>Thank you,<br>PustakBazzar Team</p>
      </div>
    `;

    await sendEmail(email, 'Password Reset Code - PustakBazzar', htmlContent);

    res.status(200).json({
      message:
        'If your email exists in our system, you will receive a reset code.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ 'profile.email': email });
    if (!user || !user.resetPasswordOTP || !user.resetPasswordOTP.code) {
      return res
        .status(400)
        .json({ message: 'OTP expired or invalid. Please request a new one.' });
    }

    const otpData = user.resetPasswordOTP;

    otpData.attempts += 1;
    user.markModified('resetPasswordOTP');
    await user.save();

    if (otpData.attempts > 5) {
      user.resetPasswordOTP = undefined;
      await user.save();
      return res.status(400).json({
        message: 'Too many incorrect attempts. Please request a new OTP.',
      });
    }

    if (new Date() > new Date(otpData.expiry)) {
      user.resetPasswordOTP = undefined;
      await user.save();
      return res
        .status(400)
        .json({ message: 'OTP expired. Please request a new one.' });
    }

    if (otpData.code !== otp) {
      await user.save();
      return res
        .status(400)
        .json({ message: 'Invalid OTP. Please try again.' });
    }

    user.resetPasswordOTP.verified = true;
    await user.save();

    res.status(200).json({ message: 'OTP verified successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res
        .status(400)
        .json({ message: 'Email, OTP and new password are required' });
    }

    const user = await User.findOne({ 'profile.email': email });
    if (!user || !user.resetPasswordOTP || !user.resetPasswordOTP.verified) {
      return res.status(400).json({ message: 'Please verify your OTP first.' });
    }

    if (user.resetPasswordOTP.code !== otp) {
      return res
        .status(400)
        .json({ message: 'Invalid OTP. Please try again.' });
    }

    user.password = password;
    user.resetPasswordOTP = undefined;

    await user.save();

    const currentDate = new Date().toLocaleString();
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e4; border-radius: 5px;">
        <h2 style="color: #333;">Password Changed Successfully</h2>
        <p>Hello ${user.profile.firstName} ${user.profile.lastName},</p>
        <p>Your password has been successfully reset on ${currentDate}.</p>
        <p>If you did not make this change, please contact our support team immediately.</p>
        <p>Thank you,<br>PustakBazzar Team</p>
      </div>
    `;

    await sendEmail(email, 'Password Changed - PustakBazzar', htmlContent);

    res.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  // getUsers,
  getUserById,
  myProfile,
  updateUser,
  deleteUser,
  addAddress,
  logout,
  refreshToken,
  // approveSeller,
  applyForSeller,
  // rejectSeller,
  myBook,
  getUserAddresses,
  googleLogin,
  forgotPassword,
  verifyOTP,
  resetPassword,
  sendEmail,
};
