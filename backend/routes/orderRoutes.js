const express = require('express');
const router = express.Router();

const {
  createOrder,
  getOrdersForUser,
  getOrdersForSeller,
  getOrdersForAdmin,
  approveRejectOrder,
  cancelOrder,
  updateOrderStatus,
  createOrderWithStripe,
} = require('../controllers/orderController');

const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
// const adminMiddleware = require("../middleware/adminMiddleware");

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management and processing
 */

/**
 * @swagger
 * /api/order:
 *   post:
 *     tags: [Orders]
 *     summary: Create a new order (typically from cart)
 *     description: Creates a new order for the authenticated user. Assumes items are taken from the user's cart.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderInput'
 *     responses:
 *       '201':
 *         description: Order created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       '400':
 *         description: Invalid input (e.g., empty cart, invalid address).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Unauthorized.
 *       '500':
 *         description: Internal server error.
 */
router.post('/', authMiddleware, createOrder);

/**
 * @swagger
 * /api/order/stripe-checkout:
 *   post:
 *     tags: [Orders]
 *     summary: Create a Stripe checkout session and an order
 *     description: Initiates a Stripe checkout session for the items in the user's cart and creates a pending order.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shippingAddress:
 *                 $ref: '#/components/schemas/ShippingAddress'
 *               # FrontendBaseUrl is used by the controller but not part of request body schema here
 *             required:
 *               - shippingAddress
 *     responses:
 *       '200':
 *         description: Stripe session created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                   description: The ID of the Stripe Checkout session.
 *       '400':
 *         description: Invalid input or empty cart.
 *       '401':
 *         description: Unauthorized.
 *       '500':
 *         description: Internal server error.
 */
router.post('/stripe-checkout', authMiddleware, createOrderWithStripe);

/**
 * @swagger
 * /api/order:
 *   get:
 *     tags: [Orders]
 *     summary: Get orders for the authenticated user
 *     description: Retrieves a list of orders placed by the currently authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of orders per page.
 *     responses:
 *       '200':
 *         description: A list of user's orders.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 totalPages: { type: 'integer' }
 *                 currentPage: { type: 'integer' }
 *                 totalOrders: { type: 'integer' }
 *       '401':
 *         description: Unauthorized.
 *       '500':
 *         description: Internal server error.
 */
router.get('/', authMiddleware, getOrdersForUser);

/**
 * @swagger
 * /api/order/seller:
 *   get:
 *     tags: [Orders]
 *     summary: Get orders for the authenticated seller
 *     description: Retrieves a list of orders containing items sold by the currently authenticated seller. Requires seller role.
 *     security:
 *       - bearerAuth: [] # Seller role is typically checked within the controller or a more specific middleware
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of orders per page.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled]
 *         description: Filter orders by status.
 *     responses:
 *       '200':
 *         description: A list of seller's orders.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 totalPages: { type: 'integer' }
 *                 currentPage: { type: 'integer' }
 *                 totalOrders: { type: 'integer' }
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden (user is not a seller or not approved).
 *       '500':
 *         description: Internal server error.
 */
router.get('/seller', authMiddleware, getOrdersForSeller);

/**
 * @swagger
 * /api/order/seller/order/approve-reject:
 *   patch:
 *     tags: [Orders]
 *     summary: Approve or reject an order item by seller
 *     description: Allows a seller to approve or reject an item within an order. Requires authentication and seller role.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: The ID of the order.
 *                 example: "60c72b2f9b1d8c001f8e4d30"
 *               itemId:
 *                 type: string
 *                 description: The ID of the item within the order.
 *                 example: "60c72b2f9b1d8c001f8e4d31"
 *               status:
 *                 type: string
 *                 enum: [processing, cancelled] # Assuming seller can approve (processing) or reject (cancelled)
 *                 description: New status for the order item.
 *             required:
 *               - orderId
 *               - itemId
 *               - status
 *     responses:
 *       '200':
 *         description: Order item status updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       '400':
 *         description: Invalid input or status transition not allowed.
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden (not the seller of this item).
 *       '404':
 *         description: Order or item not found.
 *       '500':
 *         description: Internal server error.
 */
router.patch(
  '/seller/order/approve-reject',
  authMiddleware,
  approveRejectOrder
);

/**
 * @swagger
 * /api/order/user/order/cancel:
 *   patch:
 *     tags: [Orders]
 *     summary: Cancel an order by user
 *     description: Allows a user to cancel their own order if it's still in a cancellable state (e.g., pending). Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: The ID of the order to cancel.
 *                 example: "60c72b2f9b1d8c001f8e4d30"
 *             required:
 *               - orderId
 *     responses:
 *       '200':
 *         description: Order cancelled successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       '400':
 *         description: Order cannot be cancelled (e.g., already shipped).
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden (not the owner of the order).
 *       '404':
 *         description: Order not found.
 *       '500':
 *         description: Internal server error.
 */
router.patch('/user/order/cancel', authMiddleware, cancelOrder);

/**
 * @swagger
 * /api/order/update-status:
 *   patch:
 *     tags: [Orders (Admin)]
 *     summary: Update order status (Admin)
 *     description: Allows an admin to update the status of any order. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: ID of the order to update.
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered, cancelled, donated]
 *                 description: New status for the order.
 *             required:
 *               - orderId
 *               - status
 *     responses:
 *       '200':
 *         description: Order status updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       '400':
 *         description: Invalid input or status.
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden (user is not an admin).
 *       '404':
 *         description: Order not found.
 *       '500':
 *         description: Internal server error.
 */
router.patch(
  '/update-status',
  authMiddleware,
  roleMiddleware(['admin']),
  updateOrderStatus
);

/**
 * @swagger
 * /api/order/admin:
 *   get:
 *     tags: [Orders (Admin)]
 *     summary: Get all orders (Admin)
 *     description: Retrieves all orders with pagination and optional status filtering. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of orders per page.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled, donated]
 *         description: Filter orders by status.
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter orders by user ID.
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders from this date.
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders up to this date.
 *     responses:
 *       '200':
 *         description: A list of all orders.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 totalPages: { type: 'integer' }
 *                 currentPage: { type: 'integer' }
 *                 totalOrders: { type: 'integer' }
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden (user is not an admin).
 *       '500':
 *         description: Internal server error.
 */
router.get(
  '/admin',
  authMiddleware,
  roleMiddleware(['admin']),
  getOrdersForAdmin
);

module.exports = router;
