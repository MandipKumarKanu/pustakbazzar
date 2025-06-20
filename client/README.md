# Frontend Client

## Overview
This is the frontend for the PustakBazzar application, built with React, Vite, TailwindCSS, and Zustand.

## Prerequisites
- Node.js (e.g., v18.x or later)
- Bun (optional, if using `bun install` and `bun run dev`)

## Environment Variables
Create a `.env` file in the `client` directory by copying from `.env.example`. Key variables might include:
- `VITE_API_BASE_URL`: The base URL for the backend API (e.g., `http://localhost:8000/api`).
- `VITE_CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name for image uploads.
- `VITE_CLOUDINARY_API_KEY`: Cloudinary API key.
- `VITE_CLOUDINARY_UPLOAD_PRESET`: Cloudinary upload preset.
- `VITE_GOOGLE_CLIENT_ID`: Google Client ID for frontend Google login.
- `VITE_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key for frontend payments.

Ensure all variables in `.env.example` are documented here and their purpose explained.

## Getting Started
1. Navigate to the `client` directory: `cd client`
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
The client will typically run on `http://localhost:5173`.

## Key Features & Structure
- **Pages (`src/pages`):** Main views of the application.
- **Components (`src/components`):** Reusable UI elements.
- **API Calls (`src/api`):** Functions for interacting with the backend.
- **State Management (`src/store`):** Global state using Zustand (`useAuthStore`, `useCartStore`, etc.).
- **Routing:** Handled by `react-router-dom`.
- **Styling:** TailwindCSS with Shadcn UI components.

## Building for Production
```bash
npm run build
# OR
# bun run build
```
This will create a `dist` folder with the production build.

## Linting
```bash
npm run lint
```

## Testing
To run tests (once implemented):
```bash
npm test
```
