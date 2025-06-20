const express = require('express');
const router = express.Router();

const {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  getBooksByCategory,
  getBooksBySeller,
  searchBooks,
  filterBooks,
  incrementBookViews,
  getWeeklyTopBooks,
  getMonthlyTopBooks,
  toggleFeaturedBook,
  getFeaturedBooks,
  getAllBooksForAdmin,
  getAuthors,
  generateBookDescription,
  generateReviewSummary,
  aiBookSearch,
} = require('../controllers/bookController');

const authMiddleware = require('../middleware/authMiddleware');
// const optionalAuthMiddleware = require("../middleware/optionalAuthmiddleware");
const { publicRecommendation } = require('../controllers/recommendation');
const userMiddleware = require('../middleware/optionalAuthmiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { body } = require('express-validator');
const validationHandlerMiddleware = require('../middleware/validationHandler');

/**
 * @swagger
 * /api/book:
 *   post:
 *     tags:
 *       - Books
 *     summary: Create a new book listing
 *     description: Adds a new book to the listings. Requires authentication. If `forDonation` is true, prices are ignored.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookInput'
 *     responses:
 *       '201':
 *         description: Book created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean', example: true }
 *                 data: { $ref: '#/components/schemas/Book' }
 *                 feeInfo:
 *                   type: object
 *                   properties:
 *                     platformFeePercentage: { type: 'number', example: 0.1 }
 *                     estimatedFee: { type: 'number', example: 1.1 }
 *                     estimatedEarnings: { type: 'number', example: 9.89 }
 *       '400':
 *         description: Invalid input or user not approved seller for non-donation books.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden (e.g., user not an approved seller).
 */
router.post(
  '/',
  authMiddleware,
  [
    body('title').notEmpty().trim().escape().withMessage('Title is required'),
    body('author').notEmpty().trim().escape().withMessage('Author is required'),
    body('description').notEmpty().trim().withMessage('Description is required'), // Basic check, sanitization happens elsewhere
    body('category')
      .isArray({ min: 1 })
      .withMessage('Category is required and must be an array with at least one category ID'),
    body('category.*').isMongoId().withMessage('Each category item must be a valid Mongo ID'),
    body('markedPrice') // Marked price is optional for donation books, handled in controller
      .optional({ checkFalsy: true }) // Allow null or empty string to be considered optional
      .isFloat({ min: 0 })
      .withMessage('Marked price must be a non-negative number'),
    body('sellingPrice') // Selling price is optional for donation books, handled in controller
      .optional({ checkFalsy: true })
      .isFloat({ min: 0 })
      .withMessage('Selling price must be a non-negative number'),
    body('condition')
      .isIn(['new', 'good', 'acceptable']) // Adjusted based on Book.js schema
      .withMessage('Invalid condition value'),
    body('publishYear')
      .optional({ checkFalsy: true })
      .isInt({ min: 1000, max: new Date().getFullYear() })
      .withMessage('Invalid publish year'),
    body('isbn')
      .optional({ checkFalsy: true })
      .trim()
      .isISBN()
      .withMessage('Invalid ISBN format'),
    body('forDonation')
      .optional()
      .isBoolean()
      .withMessage('forDonation must be a boolean'),
    body('images')
      .optional()
      .isArray({min: 1}) // Assuming images are sent as an array of URLs/IDs
      .withMessage('Images must be an array with at least one image'),
    body('images.*').optional().isURL().withMessage('Each image must be a valid URL'), // Or isMongoId if storing image IDs
    body('bookLanguage').optional().trim().escape(),
    body('edition').optional().trim().escape(),
  ],
  validationHandlerMiddleware,
  createBook
);

/**
 * @swagger
 * /api/book/get:
 *   post:
 *     tags:
 *       - Books
 *     summary: Get all available books with pagination, filtering, and sorting
 *     description: Retrieves a list of books that are available for sale (not for donation). Supports pagination, price range filtering, and sorting by price or creation date.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order:
 *                 type: object
 *                 properties:
 *                   type: { type: 'string', enum: ['price', 'createdAt'], default: 'createdAt', description: "Field to sort by." }
 *                   order: { type: 'string', enum: ['asc', 'desc'], default: 'desc', description: "Sort order." }
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
 *           maximum: 50
 *         description: Number of items per page (max 50).
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: integer
 *         description: Minimum selling price.
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: integer
 *         description: Maximum selling price.
 *     responses:
 *       '200':
 *         description: A list of books.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 books:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *                 totalPages: { type: 'integer' }
 *                 currentPage: { type: 'integer' }
 *       '500':
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *     security: [] # Publicly accessible
 */
router.post('/get', getAllBooks);

/**
 * @swagger
 * /api/book/weeklytop:
 *   get:
 *     tags:
 *       - Books
 *     summary: Get weekly top books
 *     description: Retrieves a list of top-viewed books added in the last 60 days (logic might be 'weekly' by name but implementation is 60 days).
 *     responses:
 *       '200':
 *         description: A list of weekly top books.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *       '500':
 *         description: Internal server error.
 *     security: []
 */
router.get('/weeklytop', getWeeklyTopBooks);

/**
 * @swagger
 * /api/book/featured:
 *   get:
 *     tags:
 *       - Books
 *     summary: Get featured books
 *     description: Retrieves a list of books marked as featured and available.
 *     responses:
 *       '200':
 *         description: A list of featured books.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *       '500':
 *         description: Internal server error.
 *     security: []
 */
router.get('/featured', getFeaturedBooks);

/**
 * @swagger
 * /api/book/search:
 *   get:
 *     tags:
 *       - Books
 *     summary: Search for books
 *     description: Searches books by query (title, author, ISBN), specific title, author, or publish year. Supports pagination.
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: General search query (searches title, author, ISBN, and publishYear if it looks like a year).
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         description: Specific title to search for.
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Specific author to search for.
 *       - in: query
 *         name: publishYear
 *         schema:
 *           type: string
 *         description: Specific publication year to search for.
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
 *           default: 20
 *         description: Number of items per page.
 *       - in: query
 *         name: distance
 *         schema:
 *           type: integer
 *           default: 2
 *         description: Max Levenshtein distance for fuzzy search (if used).
 *     responses:
 *       '200':
 *         description: A list of found books with pagination.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 books:
 *                   type: array
 *                   items:
 *                     type: object # Includes Book schema plus _fuzzyMatch
 *                     properties:
 *                       _id: { type: 'string' }
 *                       title: { type: 'string' }
 *                       # ... other Book fields from schema
 *                       _fuzzyMatch:
 *                         type: object
 *                         properties:
 *                           distance: { type: 'integer' }
 *                           field: { type: 'string' }
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalBooks: { type: 'integer' }
 *                     totalPages: { type: 'integer' }
 *                     currentPage: { type: 'integer' }
 *                     hasNextPage: { type: 'boolean' }
 *                     hasPrevPage: { type: 'boolean' }
 *       '400':
 *         description: Bad request (e.g., no search parameters).
 *       '500':
 *         description: Internal server error.
 *     security: []
 */
router.get('/search', searchBooks);

/**
 * @swagger
 * /api/book/category/{categoryId}:
 *   get:
 *     tags:
 *       - Books
 *     summary: Get books by category ID
 *     description: Retrieves books belonging to a specific category. Supports pagination. Use 'all' for categoryId to get all books (similar to /api/book/get but without price/sort in query for this specific definition).
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the category, or 'all'.
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
 *           maximum: 50
 *         description: Number of items per page (max 50).
 *     responses:
 *       '200':
 *         description: A list of books in the specified category.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 books:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *                 totalPages: { type: 'integer' }
 *                 currentPage: { type: 'integer' }
 *                 totalBooks: { type: 'integer' }
 *       '500':
 *         description: Internal server error.
 *     security: []
 */
router.get('/category/:categoryId', getBooksByCategory);

/**
 * @swagger
 * /api/book/admin:
 *   get:
 *     tags:
 *       - Books (Admin)
 *     summary: Get all books for admin panel
 *     description: Retrieves all books with pagination and optional status filtering. Requires admin authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *         description: Number of items per page.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, sold, donated, pending]
 *         description: Filter books by status.
 *     responses:
 *       '200':
 *         description: A list of books for admin.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 books:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book' # Assuming Book schema includes populated addedBy with userName and email
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalBooks: { type: 'integer' }
 *                     totalPages: { type: 'integer' }
 *                     currentPage: { type: 'integer' }
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden (not an admin).
 *       '500':
 *         description: Internal server error.
 */
router.get(
  '/admin',
  authMiddleware,
  roleMiddleware(['admin']),
  getAllBooksForAdmin
);

/**
 * @swagger
 * /api/book/get-author:
 *   get:
 *     tags:
 *       - Books
 *     summary: Get unique author names
 *     description: Retrieves a sorted list of unique author names from the book collection.
 *     responses:
 *       '200':
 *         description: A list of unique authors.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean', example: true }
 *                 count: { type: 'integer', example: 150 }
 *                 authors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["F. Scott Fitzgerald", "George Orwell"]
 *       '500':
 *         description: Internal server error.
 *     security: []
 */
router.get('/get-author', getAuthors);

/**
 * @swagger
 * /api/book/{id}:
 *   get:
 *     tags:
 *       - Books
 *     summary: Get a single book by ID
 *     description: Retrieves detailed information for a specific book. Optional authentication to track user interests.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the book.
 *     responses:
 *       '200':
 *         description: Detailed information about the book.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 book:
 *                   $ref: '#/components/schemas/Book'
 *       '404':
 *         description: Book not found.
 *       '500':
 *         description: Internal server error.
 *     security: [] # Optional auth handled by userMiddleware
 */
router.get('/:id', userMiddleware, getBookById);

/**
 * @swagger
 * /api/book/{id}:
 *   patch:
 *     tags:
 *       - Books
 *     summary: Update a book
 *     description: Updates an existing book listing. Requires authentication and user must be the owner or an admin.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the book to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookInput' # All fields are optional for update typically
 *     responses:
 *       '200':
 *         description: Book updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: 'string' }
 *                 book: { $ref: '#/components/schemas/Book' }
 *       '400':
 *         description: Invalid input.
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden (not owner or admin, or seller not approved).
 *       '404':
 *         description: Book not found.
 *       '500':
 *         description: Internal server error.
 */
router.patch(
  '/:id',
  authMiddleware,
  [
    // Similar validations for update, but all optional
    body('title').optional().notEmpty().trim().escape().withMessage('Title is required'),
    body('author').optional().notEmpty().trim().escape().withMessage('Author is required'),
    body('description').optional().notEmpty().trim().withMessage('Description is required'),
    body('category')
      .optional()
      .isArray({ min: 1 })
      .withMessage('Category must be an array with at least one category ID'),
    body('category.*').optional().isMongoId().withMessage('Each category item must be a valid Mongo ID'),
    body('markedPrice')
      .optional({ checkFalsy: true })
      .isFloat({ min: 0 })
      .withMessage('Marked price must be a non-negative number'),
    body('sellingPrice')
      .optional({ checkFalsy: true })
      .isFloat({ min: 0 })
      .withMessage('Selling price must be a non-negative number'),
    body('condition')
      .optional()
      .isIn(['new', 'good', 'acceptable'])
      .withMessage('Invalid condition value'),
    body('publishYear')
      .optional({ checkFalsy: true })
      .isInt({ min: 1000, max: new Date().getFullYear() })
      .withMessage('Invalid publish year'),
    body('isbn')
      .optional({ checkFalsy: true })
      .trim()
      .isISBN()
      .withMessage('Invalid ISBN format'),
    body('forDonation')
      .optional()
      .isBoolean()
      .withMessage('forDonation must be a boolean'),
    body('images')
      .optional()
      .isArray({ min: 1 })
      .withMessage('Images must be an array with at least one image'),
    body('images.*').optional().isURL().withMessage('Each image must be a valid URL'),
    body('bookLanguage').optional().trim().escape(),
    body('edition').optional().trim().escape(),
  ],
  validationHandlerMiddleware,
  updateBook
);

/**
 * @swagger
 * /api/book/{id}:
 *   delete:
 *     tags:
 *       - Books
 *     summary: Delete a book
 *     description: Deletes a book by its ID. Requires authentication and user must be the owner or an admin.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the book to delete.
 *     responses:
 *       '200':
 *         description: Book deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden (not owner or admin).
 *       '404':
 *         description: Book not found.
 *       '500':
 *         description: Internal server error.
 */
router.delete('/:id', authMiddleware, deleteBook);

/**
 * @swagger
 * /api/book/seller/{sellerId}:
 *   get:
 *     tags:
 *       - Books
 *     summary: Get books by seller ID
 *     description: Retrieves all books listed by a specific seller.
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the seller.
 *     responses:
 *       '200':
 *         description: A list of books by the specified seller.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 books:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *       '500':
 *         description: Internal server error.
 *     security: []
 */
router.get('/seller/:sellerId', getBooksBySeller);

/**
 * @swagger
 * /api/book/filter:
 *   get:
 *     tags:
 *       - Books
 *     summary: Filter books by various criteria
 *     description: Retrieves books based on category, price range, and condition.
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category ID to filter by.
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum selling price.
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum selling price.
 *       - in: query
 *         name: condition
 *         schema:
 *           type: string
 *           enum: [new, good, acceptable] # Ensure this matches schema
 *         description: Condition of the book.
 *     responses:
 *       '200':
 *         description: A list of filtered books.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 books:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *       '500':
 *         description: Internal server error.
 *     security: []
 */
router.get('/filter', filterBooks);

/**
 * @swagger
 * /api/book/inc/{id}:
 *   patch:
 *     tags:
 *       - Books
 *     summary: Increment book view count
 *     description: Increments the view count of a specific book.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the book to update views for.
 *     responses:
 *       '200':
 *         description: View count incremented successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 views: { type: 'integer' }
 *       '400':
 *         description: Invalid book ID.
 *       '404':
 *         description: Book not found.
 *       '500':
 *         description: Internal server error.
 *     security: [] # Publicly accessible
 */
router.patch('/inc/:id', incrementBookViews);

/**
 * @swagger
 * /api/book/toggle/{id}:
 *   patch:
 *     tags:
 *       - Books (Admin)
 *     summary: Toggle featured status of a book
 *     description: Toggles the 'isFeatured' status of a book. Requires admin authentication.
 *     security:
 *       - bearerAuth: [] # Needs admin role, which should be handled by roleMiddleware if applied
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the book to toggle featured status.
 *     responses:
 *       '201': # Should be 200 for update typically, but controller uses 201
 *         description: Book featured status updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: 'string' }
 *                 data: { $ref: '#/components/schemas/Book' }
 *       '401':
 *         description: Unauthorized.
 *       '403':
 *         description: Forbidden (not an admin).
 *       '404':
 *         description: Book not found.
 *       '500':
 *         description: Internal server error.
 */
router.patch('/toggle/:id', authMiddleware, roleMiddleware(['admin']), toggleFeaturedBook); // Added authMiddleware and roleMiddleware based on functionality

/**
 * @swagger
 * /api/book/recommendations:
 *   post:
 *     tags:
 *       - Books
 *     summary: Get book recommendations
 *     description: Retrieves book recommendations based on user interests or other criteria.
 *     requestBody:
 *       required: false # Or true, depending on how recommendations are generated
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId: { type: 'string', description: "Optional user ID for personalized recommendations" }
 *               categories: { type: 'array', items: { type: 'string' }, description: "Optional list of category IDs" }
 *     responses:
 *       '200':
 *         description: A list of recommended books.
 *         content:
 *           application/json:
 *             schema:
 *               type: array # Assuming it returns an array of books
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       '500':
 *         description: Internal server error.
 *     security: [] # Or apply security if recommendations are personalized and require auth
 */
router.post('/recommendations', publicRecommendation);

/**
 * @swagger
 * /api/book/generate-description:
 *   post:
 *     tags:
 *       - Books (AI)
 *     summary: Generate book description using AI
 *     description: Generates a book description based on title, author, and condition using an AI model. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: 'string', example: 'The Great Gatsby' }
 *               author: { type: 'string', example: 'F. Scott Fitzgerald' }
 *               condition: { type: 'string', enum: ['new', 'good', 'acceptable'], example: 'good' }
 *             required: ['title', 'author', 'condition']
 *     responses:
 *       '200':
 *         description: Book description generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean', example: true }
 *                 description: { type: 'string', format: 'html', example: '<p>A captivating story about...</p>' }
 *       '400':
 *         description: Missing required fields.
 *       '401':
 *         description: Unauthorized.
 *       '500':
 *         description: Error generating book description.
 */
router.post('/generate-description', authMiddleware, generateBookDescription); // Added authMiddleware

/**
 * @swagger
 * /api/book/summarize-review:
 *   post:
 *     tags:
 *       - Books (AI)
 *     summary: Generate book review summary using AI
 *     description: Generates a book review summary based on title and author using an AI model. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: 'string', example: 'The Great Gatsby' }
 *               author: { type: 'string', example: 'F. Scott Fitzgerald' }
 *             required: ['title', 'author']
 *     responses:
 *       '200':
 *         description: Review summary generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean', example: true }
 *                 summary: { type: 'string', format: 'html', example: '<strong>Key Points:</strong><ul><li>...</li></ul>' }
 *       '400':
 *         description: Missing required fields.
 *       '401':
 *         description: Unauthorized.
 *       '500':
 *         description: Error generating review summary.
 */
router.post('/summarize-review', authMiddleware, generateReviewSummary); // Added authMiddleware

/**
 * @swagger
 * /api/book/ai-book-search:
 *   post:
 *     tags:
 *       - Books (AI)
 *     summary: Perform AI-powered book search
 *     description: Uses an AI model to understand natural language queries and translate them into book search filters. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sId: { type: 'string', description: 'Session ID for conversation history' }
 *               query: { type: 'string', description: 'Natural language search query' }
 *             required: ['sId', 'query']
 *     responses:
 *       '200':
 *         description: AI search processed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 results:
 *                   type: object
 *                   properties:
 *                     count: { type: 'integer' }
 *                     books: { type: 'array', items: { $ref: '#/components/schemas/Book' } }
 *                     message: { type: 'string', description: "AI's textual response" }
 *                 analytics:
 *                   type: object
 *                   properties:
 *                     query: { type: 'string' }
 *                     extractedFilters: { type: 'object' } # Define this further if needed
 *                     processingTime: { type: 'string' }
 *       '400':
 *         description: Invalid input.
 *       '401':
 *         description: Unauthorized.
 *       '500':
 *         description: Error processing AI search.
 */
router.post('/ai-book-search', authMiddleware, aiBookSearch); // Added authMiddleware

module.exports = router;
