const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  myProfile,
  // getUsers,
  getUserById,
  updateUser,
  deleteUser,
  addAddress,
  logout,
  // approveSeller,
  applyForSeller,
  // rejectSeller,
  getUserAddresses,
  myBook,
  googleLogin,
  verifyOTP,
  resetPassword,
  forgotPassword,
} = require('../controllers/authController');
const authMiddleWare = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { body } = require('express-validator');
const validationHandlerMiddleware = require('../middleware/validationHandler');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Creates a new user account with the provided profile information and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       '201':
 *         description: User registered successfully. Returns an access token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       '400':
 *         description: Invalid input (e.g., email already in use, validation error).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     security: []
 */
router.post(
  '/register',
  [
    body('profile.email')
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
    body('profile.firstName')
      .notEmpty()
      .trim()
      .escape()
      .withMessage('First name is required'),
    body('profile.lastName')
      .notEmpty()
      .trim()
      .escape()
      .withMessage('Last name is required'),
    body('profile.userName')
      .notEmpty()
      .trim()
      .escape()
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  validationHandlerMiddleware,
  register
);
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Must be a valid email address')
      .normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validationHandlerMiddleware,
  login
);

/**
 * @swagger
 * /api/auth/refresh:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Refresh access token
 *     description: Obtains a new access token using the refresh token stored in an HttpOnly cookie.
 *     responses:
 *       '200':
 *         description: Access token refreshed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken: { type: 'string' }
 *       '401':
 *         description: Unauthorized (e.g., no refresh token, invalid token).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '403':
 *         description: Forbidden (e.g., refresh token expired or user not found).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     security: [] # Relies on HttpOnly cookie for refresh token
 */
router.get('/refresh', refreshToken);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     tags:
 *       - User Profile
 *     summary: Get current user's profile
 *     description: Retrieves the profile information of the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved user profile.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       '401':
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '404':
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/profile', authMiddleWare, myProfile);

/**
 * @swagger
 * /api/auth/mybooks/{forDonation}:
 *   get:
 *     tags:
 *       - User Profile
 *     summary: Get books listed by the current user
 *     description: Retrieves books (for sale or donation) listed by the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: forDonation
 *         required: true
 *         schema:
 *           type: boolean
 *         description: Set to true to fetch donation books, false for books for sale.
 *     responses:
 *       '200':
 *         description: Successfully retrieved user's books.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       '401':
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/mybooks/:forDonation', authMiddleWare, myBook);

// router.get("/users", authMiddleWare, roleMiddleware(["admin"]), getUsers);

/**
 * @swagger
 * /api/auth/user/{id}:
 *   get:
 *     tags:
 *       - User Profile
 *     summary: Get user profile by ID (Admin)
 *     description: Retrieves a specific user's profile by their ID. Requires admin privileges.
 *     security:
 *       - bearerAuth: [] # Admin role checked by roleMiddleware
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve.
 *     responses:
 *       '200':
 *         description: Successfully retrieved user profile.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden (Access denied).
 *       '404':
 *         description: User not found.
 */
router.get('/user/:id', authMiddleWare, getUserById); // Assuming roleMiddleware is applied within getUserById or this is an admin-only setup

/**
 * @swagger
 * /api/auth/profile:
 *   patch:
 *     tags:
 *       - User Profile
 *     summary: Update current user's profile
 *     description: Updates the profile information (firstName, lastName, profileImg) of the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: 'string', example: 'John Updated' }
 *               lastName: { type: 'string', example: 'Doe Updated' }
 *               profileImg: { type: 'string', format: 'url', example: 'http://example.com/newimage.png' }
 *     responses:
 *       '200':
 *         description: Profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       '401':
 *         description: Unauthorized.
 *       '500':
 *         description: Internal server error.
 */
router.patch('/profile', authMiddleWare, updateUser);

/**
 * @swagger
 * /api/auth/profile:
 *   delete:
 *     tags:
 *       - User Profile
 *     summary: Delete current user's account
 *     description: Deletes the account of the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '401':
 *         description: Unauthorized.
 *       '500':
 *         description: Internal server error.
 */
router.delete('/profile', authMiddleWare, deleteUser);

/**
 * @swagger
 * /api/auth/profile/address:
 *   patch:
 *     tags:
 *       - User Profile
 *     summary: Add a new address to user profile
 *     description: Adds a new shipping address to the authenticated user's profile. Maximum 3 addresses.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: 'string' }
 *               lastName: { type: 'string' }
 *               street: { type: 'string' }
 *               province: { type: 'string' }
 *               town: { type: 'string' }
 *               landmark: { type: 'string' }
 *               phone: { type: 'string' }
 *               email: { type: 'string', format: 'email' }
 *               isDefault: { type: 'boolean' }
 *             required: ['firstName', 'lastName', 'street', 'province', 'town', 'phone', 'email']
 *     responses:
 *       '201':
 *         description: Address added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '400':
 *         description: Cannot add more than 3 addresses or invalid input.
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: User not found.
 */
router.patch('/profile/address', authMiddleWare, addAddress);

/**
 * @swagger
 * /api/auth/profile/address:
 *   get:
 *     tags:
 *       - User Profile
 *     summary: Get user's saved addresses
 *     description: Retrieves all saved shipping addresses for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved addresses.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 addresses:
 *                   type: array
 *                   items:
 *                     type: object # Define address structure inline or reference a schema
 *                     properties:
 *                       firstName: { type: 'string' }
 *                       lastName: { type: 'string' }
 *                       street: { type: 'string' }
 *                       # ... other address fields
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: User not found.
 */
router.get('/profile/address', authMiddleWare, getUserAddresses);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Log out user
 *     description: Logs out the authenticated user by clearing the refresh token.
 *     security:
 *       - bearerAuth: [] # Requires an access token to identify the user session to log out
 *     responses:
 *       '200':
 *         description: Logged out successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '401':
 *         description: Unauthorized.
 *       '500':
 *         description: Internal server error.
 */
router.post('/logout', authMiddleWare, logout);

/**
 * @swagger
 * /api/auth/seller:
 *   post:
 *     tags:
 *       - Seller Application
 *     summary: Apply to become a seller
 *     description: Submits an application for the authenticated user to become a seller. Requires proof document.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               proofDoc: { type: 'string', format: 'url', description: 'URL to the proof document' }
 *             required: ['proofDoc']
 *     responses:
 *       '200':
 *         description: Seller application submitted.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '400':
 *         description: Already a seller or invalid request.
 *       '401':
 *         description: Unauthorized.
 */
router.post('/seller', authMiddleWare, applyForSeller);

// router.post("/seller/approve/:id", authMiddleWare, approveSeller);
// router.post("/seller/reject/:id", authMiddleWare, rejectSeller);

/**
 * @swagger
 * /api/auth/google-login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Log in or register with Google
 *     description: Authenticates a user via Google ID token. If the user doesn't exist, a new account is created.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token: { type: 'string', description: 'Google ID Token' }
 *             required: ['token']
 *     responses:
 *       '200':
 *         description: Google login successful.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       '401':
 *         description: Google authentication failed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     security: []
 */
router.post('/google-login', googleLogin);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags:
 *       - Password Reset
 *     summary: Request password reset
 *     description: Sends a password reset OTP to the user's email if the email exists in the system.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: 'string', format: 'email', example: 'user@example.com' }
 *             required: ['email']
 *     responses:
 *       '200':
 *         description: If email exists, OTP sent.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse' # Generic success message
 *       '400':
 *         description: Email is required.
 *       '500':
 *         description: Internal server error.
 *     security: []
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     tags:
 *       - Password Reset
 *     summary: Verify password reset OTP
 *     description: Verifies the OTP sent to the user's email for password reset.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: 'string', format: 'email', example: 'user@example.com' }
 *               otp: { type: 'string', example: '123456' }
 *             required: ['email', 'otp']
 *     responses:
 *       '200':
 *         description: OTP verified successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '400':
 *         description: Invalid OTP, expired, or too many attempts.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Internal server error.
 *     security: []
 */
router.post('/verify-otp', verifyOTP);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags:
 *       - Password Reset
 *     summary: Reset password
 *     description: Resets the user's password after successful OTP verification.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: 'string', format: 'email', example: 'user@example.com' }
 *               otp: { type: 'string', example: '123456' }
 *               password: { type: 'string', format: 'password', minLength: 6, example: 'newPassword123' }
 *             required: ['email', 'otp', 'password']
 *     responses:
 *       '200':
 *         description: Password reset successful.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '400':
 *         description: Invalid OTP, or OTP not verified.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '500':
 *         description: Internal server error.
 *     security: []
 */
router.post('/reset-password', resetPassword);

module.exports = router;
