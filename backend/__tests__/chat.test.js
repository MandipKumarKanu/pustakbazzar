const request = require('supertest');
const { app, server } = require('../index');
const mongoose = require('mongoose');
const User = require('../models/User');
const Message = require('../models/Message');
const Book = require('../models/Book'); // If chats are related to books

// Helper function to generate unique email
const generateUniqueEmail = (prefix = 'chatuser') => `${prefix}_${Date.now()}@example.com`;

describe('Chat API Endpoints', () => {
  let userOneToken, userTwoToken;
  let userOne, userTwo;
  let testBook; // For chats related to a book

  beforeAll(async () => {
    // Wait for mongoose to connect if not already
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    // Create User One
    const userOneEmail = generateUniqueEmail('userOne');
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'User One', email: userOneEmail, password: 'password123', role: 'user' });
    const loginResOne = await request(app)
      .post('/api/auth/login')
      .send({ email: userOneEmail, password: 'password123' });
    userOneToken = loginResOne.body.token;
    userOne = loginResOne.body.user;

    // Create User Two
    const userTwoEmail = generateUniqueEmail('userTwo');
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'User Two', email: userTwoEmail, password: 'password123', role: 'user' });
    const loginResTwo = await request(app)
      .post('/api/auth/login')
      .send({ email: userTwoEmail, password: 'password123' });
    userTwoToken = loginResTwo.body.token;
    userTwo = loginResTwo.body.user;
    
    // Create a book for context (owned by userOne, for userTwo to chat about)
     const bookRes = await request(app)
      .post('/api/book/add') // Assuming userOne needs to be a seller to add a book
      .set('Authorization', `Bearer ${userOneToken}`)
      .send({
        title: 'Chat Test Book',
        author: 'Author Chat',
        description: 'Book for chat testing',
        category: ['TestCategory'],
        isbn: `chatbook-${Date.now()}`,
        publishYear: 2024,
        condition: 'new',
        markedPrice: 100,
        sellingPrice: 80,
        images: ['http://example.com/chatbook.jpg'],
        availability: 'sell',
        quantity: 1,
      });

    if (bookRes.statusCode === 201 && bookRes.body.book) {
        testBook = bookRes.body.book;
    } else {
        // If userOne is not a seller by default, try to update them to be a seller first
        await User.findByIdAndUpdate(userOne._id, { $set: { isSeller: { status: 'approved', businessName: 'User One Books' } } });
        const retryBookRes = await request(app)
            .post('/api/book/add')
            .set('Authorization', `Bearer ${userOneToken}`)
            .send({
                title: 'Chat Test Book', author: 'Author Chat', description: 'Book for chat testing',
                category: ['TestCategory'], isbn: `chatbook-${Date.now()}-retry`, publishYear: 2024,
                condition: 'new', markedPrice: 100, sellingPrice: 80, images: ['http://example.com/chatbook.jpg'],
                availability: 'sell', quantity: 1,
            });
        if (retryBookRes.statusCode === 201 && retryBookRes.body.book) {
            testBook = retryBookRes.body.book;
        } else {
            console.error("Failed to create book for chat tests:", retryBookRes.body);
            // throw new Error('Could not create test book for chat tests.');
        }
    }
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /chatuser_.*@example\.com/ } });
    await Message.deleteMany({ $or: [{ senderId: userOne._id }, { receiverId: userOne._id }] });
    if (testBook) {
      await Book.findByIdAndDelete(testBook._id);
    }
    await mongoose.connection.close();
    server.close();
  });

  describe('POST /api/chat/send', () => {
    it('should allow userOne to send a message to userTwo', async () => {
      const res = await request(app)
        .post('/api/chat/send')
        .set('Authorization', `Bearer ${userOneToken}`)
        .send({
          receiverId: userTwo._id,
          content: 'Hello User Two!',
          bookId: testBook?._id, // Optional: associate with a book
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.content).toEqual('Hello User Two!');
      expect(res.body.senderId._id).toEqual(userOne._id.toString());
      expect(res.body.receiverId._id).toEqual(userTwo._id.toString());
      if (testBook) {
        expect(res.body.bookId._id).toEqual(testBook._id.toString());
      }
    });

    it('should fail if sending a message without authentication', async () => {
      const res = await request(app)
        .post('/api/chat/send')
        .send({ receiverId: userTwo._id, content: 'Anonymous Hello' });
      expect(res.statusCode).toEqual(401);
    });

    it('should fail if receiverId is missing', async () => {
      const res = await request(app)
        .post('/api/chat/send')
        .set('Authorization', `Bearer ${userOneToken}`)
        .send({ content: 'Hello with no receiver' });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'ReceiverId and content are required');
    });

    it('should fail if content is missing', async () => {
        const res = await request(app)
          .post('/api/chat/send')
          .set('Authorization', `Bearer ${userOneToken}`)
          .send({ receiverId: userTwo._id });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'ReceiverId and content are required');
      });

    it('should fail if receiverId is invalid/non-existent', async () => {
        const nonExistentUserId = new mongoose.Types.ObjectId().toString();
        const res = await request(app)
            .post('/api/chat/send')
            .set('Authorization', `Bearer ${userOneToken}`)
            .send({ receiverId: nonExistentUserId, content: 'Hello to Ghost' });
        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('message', 'Receiver not found');
    });
  });

  describe('GET /api/chat/history/:otherUserId', () => {
    beforeAll(async () => {
      // Ensure there's a message from userOne to userTwo
      await request(app)
        .post('/api/chat/send')
        .set('Authorization', `Bearer ${userOneToken}`)
        .send({ receiverId: userTwo._id, content: 'History message 1', bookId: testBook?._id });
      // And a reply from userTwo to userOne
      await request(app)
        .post('/api/chat/send')
        .set('Authorization', `Bearer ${userTwoToken}`)
        .send({ receiverId: userOne._id, content: 'History reply 1', bookId: testBook?._id });
    });

    it('userOne should fetch chat history with userTwo', async () => {
      const res = await request(app)
        .get(`/api/chat/history/${userTwo._id}${testBook ? `?bookId=${testBook._id}` : ''}`)
        .set('Authorization', `Bearer ${userOneToken}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2); // At least the two messages sent in beforeAll
      // Check if messages are correctly ordered (newest first by default)
      if (res.body.length >= 2) {
        expect(new Date(res.body[0].timestamp).getTime()).toBeGreaterThanOrEqual(new Date(res.body[1].timestamp).getTime());
      }
    });
    
    it('should fail to fetch history without authentication', async () => {
        const res = await request(app).get(`/api/chat/history/${userTwo._id}`);
        expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/chat/conversations', () => {
    it('userOne should retrieve their conversations list', async () => {
      // Ensure userOne has at least one conversation (with userTwo)
      // Messages already sent in previous describe block
      const res = await request(app)
        .get('/api/chat/conversations')
        .set('Authorization', `Bearer ${userOneToken}`);
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      const conversationWithUserTwo = res.body.find(conv => conv.otherUserId === userTwo._id.toString());
      expect(conversationWithUserTwo).toBeDefined();
      expect(conversationWithUserTwo).toHaveProperty('lastMessage');
      expect(conversationWithUserTwo).toHaveProperty('unreadCount'); // Will be 0 if userOne sent the last message or read it
    });
  });

  describe('PUT /api/chat/messages/mark-as-read', () => {
    let messageToMarkId;
    beforeAll(async () => {
      // UserTwo sends a message to UserOne, which UserOne will mark as read
      const msgRes = await request(app)
        .post('/api/chat/send')
        .set('Authorization', `Bearer ${userTwoToken}`)
        .send({ receiverId: userOne._id, content: 'Mark me as read!', bookId: testBook?._id });
      messageToMarkId = msgRes.body._id;
    });

    it('userOne should mark messages from userTwo as read', async () => {
      const res = await request(app)
        .put('/api/chat/messages/mark-as-read')
        .set('Authorization', `Bearer ${userOneToken}`)
        .send({ senderId: userTwo._id, bookId: testBook?._id }); // UserOne is marking messages sent by UserTwo
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body.count).toBeGreaterThanOrEqual(1); // At least one message should be marked as read

      // Verify the message is actually marked as read in DB (optional deep check)
      const markedMessage = await Message.findById(messageToMarkId);
      expect(markedMessage.read).toBe(true);
    });

    it('should fail to mark messages as read without authentication', async () => {
        const res = await request(app)
          .put('/api/chat/messages/mark-as-read')
          .send({ senderId: userTwo._id });
        expect(res.statusCode).toEqual(401);
    });
    
    it('should fail if senderId is missing', async () => {
        const res = await request(app)
          .put('/api/chat/messages/mark-as-read')
          .set('Authorization', `Bearer ${userOneToken}`)
          .send({ bookId: testBook?._id }); // Missing senderId
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('message', 'senderId is required');
    });
  });
});
