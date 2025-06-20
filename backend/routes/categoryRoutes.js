const express = require('express');
const router = express.Router();
const {
  createCategory,
  updateCategory,
  getAllCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management
 */

/**
 * @swagger
 * /api/category:
 *   get:
 *     tags: [Categories]
 *     summary: Get all categories
 *     description: Retrieves a list of all categories. This endpoint is public.
 *     responses:
 *       '200':
 *         description: A list of categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     security: []
 */
router.get('/', getAllCategory);

/**
 * @swagger
 * /api/category:
 *   post:
 *     tags: [Categories]
 *     summary: Create a new category
 *     description: Adds a new category to the system. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryName:
 *                 type: string
 *                 example: "Science Fiction"
 *                 description: "Name of the category"
 *               description:
 *                 type: string
 *                 example: "Books about futuristic science and technology."
 *                 description: "Optional description of the category"
 *             required:
 *               - categoryName
 *     responses:
 *       '201':
 *         description: Category created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       '400':
 *         description: Invalid input (e.g., category name already exists).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden (user is not an admin).
 *       '500':
 *         description: Internal server error.
 */
router.post('/', authMiddleware, roleMiddleware(['admin']), createCategory);

/**
 * @swagger
 * /api/category:
 *   patch:
 *     tags: [Categories]
 *     summary: Update an existing category
 *     description: Updates an existing category's details. Requires admin privileges. The ID of the category to update should be in the request body.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: "ID of the category to update"
 *                 example: "60c72b2f9b1d8c001f8e4d2b"
 *               categoryName:
 *                 type: string
 *                 example: "Updated Science Fiction"
 *                 description: "New name for the category"
 *               description:
 *                 type: string
 *                 example: "Updated description for Sci-Fi books."
 *                 description: "New description for the category"
 *             required:
 *               - id
 *     responses:
 *       '200':
 *         description: Category updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       '400':
 *         description: Invalid input (e.g., ID missing, category name already exists).
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden (user is not an admin).
 *       '404':
 *         description: Category not found.
 *       '500':
 *         description: Internal server error.
 */
router.patch('/', authMiddleware, roleMiddleware(['admin']), updateCategory);

/**
 * @swagger
 * /api/category/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete a category
 *     description: Deletes a category by its ID. Requires admin privileges.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the category to delete.
 *     responses:
 *       '200':
 *         description: Category deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden (user is not an admin).
 *       '404':
 *         description: Category not found.
 *       '500':
 *         description: Internal server error.
 */
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware(['admin']),
  deleteCategory
);

module.exports = router;
