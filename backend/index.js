require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const categoryRoutes = require('./routes/categoryRoutes');
const payoutRouter = require('./routes/payoutRoute');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const saveForLaterRoutes = require('./routes/saveForLaterRoutes');
const cartRoute = require('./routes/cartRoute');
const orderRoutes = require('./routes/orderRoutes');
const donationRoutes = require('./routes/donationRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const contactRoutes = require('./routes/contactRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

// Swagger JSDoc options
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PustakBazzar API',
      version: '1.0.0',
      description:
        'API documentation for the PustakBazzar application, providing services for book listings, user authentication, orders, and more.',
      contact: {
        name: 'API Support',
        // url: 'http://www.example.com/support',
        // email: 'support@example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 8000}/api`, // Adjusted to include /api base path
        description: 'Development server',
      },
      // You can add more server URLs here (e.g., for staging or production)
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'Error message' },
            // errors: { type: 'array', items: { type: 'object' }, description: 'Optional array of validation errors' }
          },
          required: ['message'],
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'Success message' },
          },
          required: ['message'],
        },
        UserInput: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password', minLength: 6 },
          },
        },
        RegisterInputProfile: {
          type: 'object',
          properties: {
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
            userName: { type: 'string', example: 'johndoe' },
          },
          required: ['firstName', 'lastName', 'email', 'userName'],
        },
        RegisterInput: {
          type: 'object',
          properties: {
            profile: { $ref: '#/components/schemas/RegisterInputProfile' },
            password: { type: 'string', format: 'password', minLength: 6, example: 'password123' },
          },
          required: ['profile', 'password'],
        },
        LoginInput: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
            password: { type: 'string', format: 'password', example: 'password123' },
          },
          required: ['email', 'password'],
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'Success message', example: 'Login successful.' },
            accessToken: { type: 'string', description: 'JWT Access Token' },
          },
        },
        UserProfile: {
          type: 'object',
          properties: {
            _id: { type: 'string', description: 'User ID', example: '60c72b2f9b1d8c001f8e4d2a' },
            profile: {
              type: 'object',
              properties: {
                firstName: { type: 'string', example: 'John' },
                lastName: { type: 'string', example: 'Doe' },
                userName: { type: 'string', example: 'johndoe' },
                email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
                profileImg: { type: 'string', format: 'url', example: 'http://example.com/image.png' },
                role: { type: 'string', enum: ['user', 'admin', 'seller'], example: 'user' },
              },
            },
            isSeller: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['not_applied', 'applied', 'approved', 'rejected'], example: 'approved' },
              },
            },
          },
        },
        Category: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60c72b2f9b1d8c001f8e4d2b' },
            categoryName: { type: 'string', example: 'Fiction' },
            description: { type: 'string', example: 'Books in the fiction genre.' },
          },
          required: ['categoryName'],
        },
        Book: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60c72b2f9b1d8c001f8e4d2c' },
            title: { type: 'string', example: 'The Great Gatsby' },
            author: { type: 'string', example: 'F. Scott Fitzgerald' },
            description: { type: 'string', example: 'A novel about the American dream.' },
            category: { type: 'array', items: { $ref: '#/components/schemas/Category' } },
            sellingPrice: { type: 'number', format: 'float', example: 10.99 },
            markedPrice: { type: 'number', format: 'float', example: 12.99 },
            images: { type: 'array', items: { type: 'string', format: 'url' }, example: ['http://example.com/image1.png'] },
            condition: { type: 'string', enum: ['new', 'good', 'fair', 'poor'], example: 'good' },
            status: { type: 'string', enum: ['available', 'sold', 'donated', 'pending'], example: 'available' },
            addedBy: { type: 'string', description: 'User ID of the seller/donator', example: '60c72b2f9b1d8c001f8e4d2a' },
            forDonation: { type: 'boolean', example: false },
            publishYear: { type: 'string', example: '1925' },
            edition: { type: 'string', example: 'First Edition' },
            bookLanguage: { type: 'string', example: 'English' },
            isbn: { type: 'string', example: '978-3-16-148410-0' },
            views: { type: 'integer', example: 100 },
            isFeatured: { type: 'boolean', example: false },
          },
          required: ['title', 'author', 'sellingPrice', 'condition', 'status'],
        },
        BookInput: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'The Great Gatsby' },
            author: { type: 'string', example: 'F. Scott Fitzgerald' },
            description: { type: 'string', example: 'Rich HTML content for description' },
            category: { type: 'array', items: { type: 'string' }, description: 'Array of Category IDs', example: ['60c72b2f9b1d8c001f8e4d2b'] },
            markedPrice: { type: 'number', format: 'float', example: 12.99 },
            sellingPrice: { type: 'number', format: 'float', example: 10.99 },
            images: { type: 'array', items: { type: 'string', format: 'url' }, example: ['http://example.com/image1.png'] },
            condition: { type: 'string', enum: ['new', 'good', 'fair', 'poor'], example: 'good' },
            forDonation: { type: 'boolean', example: false },
            publishYear: { type: 'string', example: '1925' },
            edition: { type: 'string', example: 'First Edition' },
            language: { type: 'string', example: 'English' }, // Corresponds to bookLanguage in model
            isbn: { type: 'string', example: '978-3-16-148410-0' },
          },
        },
        CartItem: {
          type: 'object',
          properties: {
            book: { $ref: '#/components/schemas/Book' },
            quantity: { type: 'integer', example: 1, minimum: 1 },
            // priceAtAddition: { type: 'number', example: 10.99 } // Example if price is captured
          }
        },
        Cart: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60c72b2f9b1d8c001f8e4d2f' },
            user: { $ref: '#/components/schemas/UserProfile' }, // Assuming UserProfile is defined
            items: { type: 'array', items: { $ref: '#/components/schemas/CartItem' } },
            totalPrice: { type: 'number', example: 21.98 },
            // Could also include totalQuantity or other cart-level summaries
          }
        },
        AddToCartInput: {
          type: 'object',
          properties: {
            quantity: { type: 'integer', default: 1, example: 1, minimum: 1 }
          }
          // bookId is part of the path for POST /api/cart/add/{bookId}
        },
        // UpdateCartItemInput might not be needed if add manages quantity updates
        // and remove is by bookId. If a specific update quantity endpoint exists, it would be:
        // UpdateCartItemInput: {
        //   type: 'object',
        //   properties: {
        //     quantity: { type: 'integer', required: true, example: 2, minimum: 1 }
        //   },
        //   required: ['quantity']
        // }
        OrderItem: {
          type: 'object',
          properties: {
            book: { $ref: '#/components/schemas/Book' },
            quantity: { type: 'integer', example: 1 },
            price: { type: 'number', example: 10.99, description: "Price of the book at the time of order" }
          }
        },
        ShippingAddress: {
          type: 'object',
          properties: {
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            street: { type: 'string', example: '123 Main St' },
            town: { type: 'string', example: 'Anytown' },
            province: { type: 'string', example: 'State' },
            landmark: { type: 'string', example: 'Near the park' },
            phone: { type: 'string', example: '555-1234' },
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60c72b2f9b1d8c001f8e4d30' },
            user: { $ref: '#/components/schemas/UserProfile' },
            items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
            totalAmount: { type: 'number', example: 21.98 },
            shippingAddress: { $ref: '#/components/schemas/ShippingAddress' },
            paymentDetails: {
              type: 'object',
              properties: {
                paymentMethod: { type: 'string', enum: ['khalti', 'stripe', 'cod'], example: 'khalti' },
                paymentStatus: { type: 'string', enum: ['pending', 'paid', 'failed'], example: 'paid' },
                transactionId: { type: 'string', example: 'txn_123abc' }
              }
            },
            orderStatus: {
              type: 'string',
              enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'donated'],
              example: 'processing'
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateOrderInput: {
          type: 'object',
          properties: {
            shippingAddress: { $ref: '#/components/schemas/ShippingAddress' },
            paymentMethod: { type: 'string', enum: ['khalti', 'stripe', 'cod'], example: 'khalti' }
            // items will likely be derived from the user's cart on the backend
          },
          required: ['shippingAddress', 'paymentMethod']
        },
        UpdateOrderStatusInput: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], // admin might have different statuses than user/seller
              description: "New status for the order"
            },
            // orderId might be in path, or in body if updating multiple
            orderId: { type: 'string', description: "ID of the order to update (if not in path)"}
          },
          required: ['status']
        }
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Path to the API docs (JSDoc comments)
  apis: ['./routes/*.js'], // This will scan all .js files in the routes directory
};

// Generate the Swagger specification
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

connectDB();

app.post(
  '/api/webhook/stripe',
  express.raw({ type: 'application/json' }),
  require('./controllers/transactionController').handleStripeWebhook
);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URLS
      ? process.env.CLIENT_URLS.split(',')
      : ['http://localhost:5173', 'http://localhost:8089'], // Default to localhost for client and locust
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  next();
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/book', bookRoutes);
app.use('/api/category', categoryRoutes);
app.use('/api/save', saveForLaterRoutes);
app.use('/api/payouts', payoutRouter);
app.use('/api/cart', cartRoute);
app.use('/api/order', orderRoutes);
app.use('/api/donation', donationRoutes);
app.use('/api/khaltipay', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/seller', sellerRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
