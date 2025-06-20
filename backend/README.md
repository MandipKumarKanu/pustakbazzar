# Backend

## Overview
This is the backend for the PustakBazzar application, built with Node.js, Express, and MongoDB. It provides the API for the frontend client.

## Prerequisites
- Node.js (e.g., v18.x or later)
- MongoDB
- Bun (optional, if using `bun install` and `bun run dev`)

## Environment Variables
Create a `.env` file in the `backend` directory by copying from `.env.example`. Key variables include:
- `MONGO_URI`: MongoDB connection string.
- `PORT`: Server port (defaults to 8000).
- `CLIENT_URL`: Allowed client origin for CORS.
- `ACCESS_TOKEN_SECRET`: Secret for JWT access tokens.
- `REFRESH_TOKEN_SECRET`: Secret for JWT refresh tokens.
- `GOOGLE_CLIENT_ID`: For Google OAuth.
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_SENDER`: For email service (Nodemailer).
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`: For Stripe payments.
- `GEMINI_API_KEY`: For AI features.
- `PASSWORD_SALT`: For Google login password generation.

Ensure all variables in `.env.example` are documented here and their purpose explained.

## Getting Started
1. Navigate to the `backend` directory: `cd backend`
2. Install dependencies:
   ```bash
   npm install
   # OR if using bun
   # bun install
   ```
3. Start the development server:
   ```bash
   npm run dev
   # OR if using bun
   # bun run dev
   ```
The server will typically run on `http://localhost:8000`.

## API Endpoints Overview
- `/api/auth`: Authentication (register, login, logout, refresh token, Google login, password reset)
- `/api/book`: Book management (CRUD, search, filter, AI generation)
- `/api/category`: Category management
- `/api/cart`: Shopping cart operations
- `/api/order`: Order processing
- `/api/donation`: Donation management
- `/api/khaltipay` & `/api/transactions`: Payment processing (Khalti, Stripe webhooks)
- `/api/admin`: Admin-specific functionalities
- `/api/seller`: Seller applications and management
- `/api/payouts`: Payouts for sellers
- `/api/save`: Saved/Wishlist items
- `/api/contact`: Contact messages

(Consider generating more detailed API documentation using tools like Swagger/OpenAPI in a future step).

## Testing
To run tests (once implemented):
```bash
npm test
```
