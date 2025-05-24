const request = require('supertest');
const { app, server } = require('../index'); // Use the exported app
const mongoose = require('mongoose');
const User = require('../models/User'); // Assuming User model is needed for cleanup or setup

// Helper function to generate unique email for testing
const generateUniqueEmail = () => `testuser_${Date.now()}@example.com`;

describe('Auth API Endpoints', () => {
  // Hold a test user and token for authenticated tests
  let testUser;
  let authToken;

  // Connect to DB before all tests if not already connected by app import
  beforeAll(async () => {
    // The connectDB() in index.js should handle the connection.
    // If tests run in parallel or a separate connection is needed, manage here.
    // For now, assuming index.js connection is sufficient.
    // Wait for mongoose to connect if not already
     if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }
  });

  // Clean up any created users and close DB connection after all tests
  afterAll(async () => {
    if (testUser) {
      await User.deleteOne({ email: testUser.email });
    }
    await mongoose.connection.close();
    server.close(); // Close the server instance imported from index.js
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const uniqueEmail = generateUniqueEmail();
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: uniqueEmail,
          password: 'password123',
          role: 'user', // Assuming 'user' is a valid role
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', uniqueEmail);
      // Store for potential cleanup, though registration might not return full user object
      testUser = { email: uniqueEmail }; 
    });

    it('should fail registration with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: generateUniqueEmail(),
          // Missing name and password
        });
      expect(res.statusCode).toEqual(400); // Or based on your validation middleware
      // Add more specific error message checks if your API returns them
    });

    it('should fail registration with an existing email', async () => {
      const uniqueEmail = generateUniqueEmail();
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User Existing',
          email: uniqueEmail,
          password: 'password123',
          role: 'user',
        });
      
      // Attempt to register again with the same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: uniqueEmail,
          password: 'password123',
          role: 'user',
        });
      expect(res.statusCode).toEqual(400); // Assuming 400 for duplicate email
      expect(res.body).toHaveProperty('message', 'User already exists with this email');
       // Clean up the created user for this specific test case
      await User.deleteOne({ email: uniqueEmail });
    });
  });

  describe('POST /api/auth/login', () => {
    const loginEmail = generateUniqueEmail();
    const loginPassword = 'password123';

    beforeAll(async () => {
      // Create a user to test login
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Login Test User',
          email: loginEmail,
          password: loginPassword,
          role: 'user',
        });
    });
    
    afterAll(async () => {
        await User.deleteOne({ email: loginEmail });
    });

    it('should login an existing user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: loginEmail,
          password: loginPassword,
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('email', loginEmail);
      authToken = res.body.token; // Save for authenticated tests
      testUser = res.body.user; // Save for other tests if needed
    });

    it('should fail login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: loginEmail,
          password: 'wrongpassword',
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should fail login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });
      expect(res.statusCode).toEqual(401); // Or 404 depending on implementation
      expect(res.body).toHaveProperty('message', 'Invalid credentials'); // Or "User not found"
    });
  });
});
