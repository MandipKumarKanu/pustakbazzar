const request = require('supertest');
const { app, server } = require('../index');
const mongoose = require('mongoose');
const Book = require('../models/Book');
const User = require('../models/User'); // For creating a seller user

// Helper function to generate unique email for testing
const generateUniqueEmail = () => `testseller_${Date.now()}@example.com`;

describe('Book API Endpoints', () => {
  let sellerToken;
  let sellerUser;
  let testBookId;

  beforeAll(async () => {
    // Wait for mongoose to connect if not already
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    // Create a seller user and log in to get a token
    const sellerEmail = generateUniqueEmail();
    const sellerPassword = 'password123';
    const sellerName = 'Test Seller';

    await request(app)
      .post('/api/auth/register')
      .send({
        name: sellerName,
        email: sellerEmail,
        password: sellerPassword,
        role: 'seller', // Assuming role can be set at registration
      });
    
    // Update the user to be an approved seller directly for testing purposes
    // This bypasses any manual approval process that might exist
    sellerUser = await User.findOneAndUpdate(
        { email: sellerEmail },
        { $set: { 
            isSeller: { status: 'approved', businessName: 'Test Books Co' } 
        } },
        { new: true }
    );


    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: sellerEmail, password: sellerPassword });
    
    sellerToken = loginRes.body.token;
  });

  afterAll(async () => {
    if (sellerUser) {
      await User.deleteOne({ email: sellerUser.email });
    }
    if (testBookId) {
      await Book.findByIdAndDelete(testBookId);
    }
    await mongoose.connection.close();
    server.close();
  });

  describe('POST /api/book/add', () => {
    it('should create a new book successfully for an authenticated seller', async () => {
      const res = await request(app)
        .post('/api/book/add')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          title: 'Test Book Title',
          author: 'Test Author',
          description: 'A description for the test book.',
          category: ['Fiction'], // Assuming category is an array of strings
          isbn: `123-${Date.now()}`, // Unique ISBN
          publishYear: 2023,
          publisher: 'Test Publisher',
          bookLanguage: 'English',
          pageCount: 300,
          condition: 'new', // 'new', 'good', 'fair'
          markedPrice: 200,
          sellingPrice: 150,
          images: ['http://example.com/image1.jpg'], // Array of image URLs
          availability: 'sell', // 'sell', 'rent', 'donate'
          quantity: 10,
          // addedBy will be set by the backend using the token
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Book added successfully');
      expect(res.body).toHaveProperty('book');
      expect(res.body.book).toHaveProperty('title', 'Test Book Title');
      testBookId = res.body.book._id; // Save for later tests
    });

    it('should fail to create a book if not authenticated', async () => {
      const res = await request(app)
        .post('/api/book/add')
        .send({ title: 'Another Book', author: 'Author' }); // Missing required fields for brevity
      expect(res.statusCode).toEqual(401); // Unauthorized
    });

    it('should fail to create a book with missing required fields', async () => {
        const res = await request(app)
          .post('/api/book/add')
          .set('Authorization', `Bearer ${sellerToken}`)
          .send({
            // Missing title, author, etc.
            description: 'A book with missing fields.',
          });
        expect(res.statusCode).toEqual(400); // Bad Request due to validation
        // Add more specific error message checks if your API returns them
        expect(res.body).toHaveProperty('errors'); // Assuming express-validator like errors
      });
  });

  describe('GET /api/book/all', () => {
    it('should retrieve a list of all books', async () => {
      const res = await request(app).get('/api/book/all');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('books');
      expect(Array.isArray(res.body.books)).toBe(true);
      // Optionally, check if the previously added book is in the list if no filters applied
    });
  });

  describe('GET /api/book/:id', () => {
    it('should retrieve a specific book by its ID', async () => {
      // This test depends on a book being created, e.g., in the POST test
      if (!testBookId) {
        // Create a book if one wasn't created by previous tests for some reason
        const bookRes = await request(app)
            .post('/api/book/add')
            .set('Authorization', `Bearer ${sellerToken}`)
            .send({ title: 'Temporary Book for GET', author: 'Temp Author', description: 'Desc', category: ['Test'], isbn: `tmp-${Date.now()}`, publishYear: 2023, condition: 'new', markedPrice: 10, sellingPrice: 5, images: [], availability: 'sell', quantity: 1 });
        if (bookRes.body.book && bookRes.body.book._id) {
            testBookId = bookRes.body.book._id;
        } else {
            throw new Error('Failed to create temporary book for GET test');
        }
      }

      const res = await request(app).get(`/api/book/${testBookId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('book');
      expect(res.body.book._id).toEqual(testBookId.toString());
    });

    it('should return 404 for a non-existent book ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString(); // Generate a valid but non-existent ObjectId
      const res = await request(app).get(`/api/book/${nonExistentId}`);
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Book not found');
    });

    it('should return 500 for an invalid book ID format', async () => {
        const invalidId = 'invalid-book-id';
        const res = await request(app).get(`/api/book/${invalidId}`);
        expect(res.statusCode).toEqual(500); // Or 400 depending on error handling for invalid ObjectId
        // Mongoose might throw a CastError which could lead to a 500 if not handled specifically
        // Or if there's specific validation for ID format, it could be 400.
        // Based on typical Express error handling without specific middleware for CastError, 500 is common.
      });
  });
});
