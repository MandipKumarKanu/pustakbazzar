const express = require('express');
const router = express.Router();
const {
  addItemToCart,
  getCart,
  removeItemFromCart,
  clearCart,
  removeSellerItemsFromCart,
  isInCart,
} = require('../controllers/CartController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart operations
 */

/**
 * @swagger
 * /api/cart/add/{bookId}:
 *   post:
 *     tags: [Cart]
 *     summary: Add an item to the cart or update its quantity
 *     description: Adds a book to the user's cart. If the book is already in the cart, its quantity is updated. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the book to add to the cart.
 *     requestBody:
 *       required: false # Quantity is optional, defaults to 1 in controller if not provided
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddToCartInput'
 *     responses:
 *       '200':
 *         description: Item added or updated in cart successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       '400':
 *         description: Invalid input (e.g., book not available, invalid quantity).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Book not found.
 *       '500':
 *         description: Internal server error.
 */
router.post('/add/:bookId', authMiddleware, addItemToCart);

/**
 * @swagger
 * /api/cart/incart/{bookId}:
 *   get:
 *     tags: [Cart]
 *     summary: Check if a book is in the cart
 *     description: Checks if a specific book is already present in the user's cart. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the book to check.
 *     responses:
 *       '200':
 *         description: Returns true if the book is in the cart, false otherwise.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inCart: { type: 'boolean' }
 *                 quantity: { type: 'integer', nullable: true, description: "Quantity in cart if present" }
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: User or Cart not found.
 *       '500':
 *         description: Internal server error.
 */
router.get('/incart/:bookId', authMiddleware, isInCart);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get the user's cart
 *     description: Retrieves the current state of the authenticated user's shopping cart.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved the cart.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Cart not found for the user.
 *       '500':
 *         description: Internal server error.
 */
router.get('/', authMiddleware, getCart);

/**
 * @swagger
 * /api/cart/remove/{bookId}:
 *   post: # Should ideally be DELETE, but current implementation is POST
 *     tags: [Cart]
 *     summary: Remove an item from the cart
 *     description: Removes a specific book from the user's cart. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the book to remove from the cart.
 *     responses:
 *       '200':
 *         description: Item removed from cart successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       '400':
 *         description: Invalid input.
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Book not found in cart or User/Cart not found.
 *       '500':
 *         description: Internal server error.
 */
router.post('/remove/:bookId', authMiddleware, removeItemFromCart);

/**
 * @swagger
 * /api/cart/clear:
 *   post: # Should ideally be DELETE
 *     tags: [Cart]
 *     summary: Clear the cart
 *     description: Removes all items from the user's shopping cart. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Cart cleared successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse' # Or an empty cart object
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Cart not found.
 *       '500':
 *         description: Internal server error.
 */
router.post('/clear', authMiddleware, clearCart);

/**
 * @swagger
 * /api/cart/seller/{sellerId}:
 *   post: # Should ideally be DELETE
 *     tags: [Cart]
 *     summary: Remove all items from a specific seller from the cart
 *     description: Removes all items belonging to a specific seller from the user's shopping cart. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the seller whose items should be removed from the cart.
 *     responses:
 *       '200':
 *         description: Items from the specified seller removed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cart'
 *       '401':
 *         description: Unauthorized.
 *       '404':
 *         description: Cart not found or no items from this seller.
 *       '500':
 *         description: Internal server error.
 */
router.post('/seller/:sellerId', authMiddleware, removeSellerItemsFromCart);

module.exports = router;
