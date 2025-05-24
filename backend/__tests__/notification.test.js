const request = require('supertest');
const { app, server } = require('../index');
const mongoose = require('mongoose');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { createNotification } = require('../services/notificationService');
const mailService = require('../services/mailService'); // To mock its methods
const linkGenerator = require('../utils/linkGenerator'); // For link structure verification

// Mock mailService
jest.mock('../services/mailService', () => ({
  loadTemplate: jest.fn(),
  sendEmail: jest.fn(),
}));

// Mock linkGenerator (optional, if you want to ensure it's called but not its actual output)
// jest.mock('../utils/linkGenerator', () => ({
//   generateChatLink: jest.fn().mockReturnValue('http://mockurl/chat/123'),
//   generateOrderDetailsLink: jest.fn().mockReturnValue('http://mockurl/order/123'),
//   // ... mock other link generators
// }));


describe('Notification System', () => {
  let userOne, userTwo, userOneToken, userTwoToken;
  let mockIo;

  const setupUser = async (namePrefix) => {
    const email = `${namePrefix}_${Date.now()}@example.com`;
    const password = 'password123';
    await request(app)
      .post('/api/auth/register')
      .send({ name: `${namePrefix} User`, email, password, role: 'user' });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
    return { user: loginRes.body.user, token: loginRes.body.token, email };
  };

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI);
    }
    const userOneData = await setupUser('notifUserOne');
    userOne = userOneData.user;
    userOneToken = userOneData.token;

    const userTwoData = await setupUser('notifUserTwo');
    userTwo = userTwoData.user;
    // userTwoToken = userTwoData.token; // We might not need userTwoToken for these tests

    // Mock Socket.IO instance and its methods
    mockIo = {
      to: jest.fn().mockReturnThis(), // Allows chaining .to().emit()
      emit: jest.fn(),
    };
    app.set('io', mockIo); // Set the mock io instance to the app for controllers/services to use
    app.set('userSockets', { [userOne._id]: 'socket1', [userTwo._id]: 'socket2' });
  });

  afterEach(async () => {
    // Clear mocks after each test
    jest.clearAllMocks();
    await Notification.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /notifUserOne_.*@example\.com/ } });
    await User.deleteMany({ email: { $regex: /notifUserTwo_.*@example\.com/ } });
    await mongoose.connection.close();
    server.close();
  });

  describe('notificationService.createNotification', () => {
    beforeEach(() => {
        // Provide a mock implementation for User.findById for the service layer
        // This avoids hitting the DB for user email if we just test the service logic
        jest.spyOn(User, 'findById').mockImplementation((userId) => {
            if (userId === userTwo._id.toString()) {
                return {
                    select: jest.fn().mockReturnThis(),
                    lean: jest.fn().mockResolvedValue({ 
                        _id: userTwo._id, 
                        email: userTwo.email, 
                        name: userTwo.name || 'User Two Test Name' 
                    }),
                };
            }
            return null;
        });
    });
    
    it('should save notification to DB and emit socket event', async () => {
      const notificationData = {
        userId: userTwo._id.toString(),
        type: 'general',
        message: 'This is a general notification.',
      };
      const createdNotif = await createNotification(
        mockIo,
        notificationData.userId,
        notificationData.type,
        notificationData.message
      );

      expect(createdNotif).toBeDefined();
      expect(createdNotif.user.toString()).toEqual(notificationData.userId);
      expect(createdNotif.message).toEqual(notificationData.message);
      expect(createdNotif.type).toEqual(notificationData.type);

      const dbNotif = await Notification.findById(createdNotif._id);
      expect(dbNotif).toBeDefined();
      expect(dbNotif.message).toEqual(notificationData.message);

      expect(mockIo.to).toHaveBeenCalledWith(notificationData.userId);
      expect(mockIo.emit).toHaveBeenCalledWith('newNotification', expect.objectContaining({
        message: notificationData.message,
      }));
      expect(mailService.sendEmail).not.toHaveBeenCalled(); // No email for 'general' type by default
    });

    it('should send email for "new_message" notification type', async () => {
      const notificationData = {
        userId: userTwo._id.toString(),
        type: 'new_message',
        message: 'You have a new message from User One about "Test Book".',
        relatedEntityDetails: {
          entityType: 'Chat',
          entityId: 'chatOrBookId123',
          senderName: 'User One Test Name',
          messagePreview: 'Hey, is this available?',
          bookTitle: 'Test Book',
          originalSenderId: userOne._id.toString(),
          bookId: 'bookId123'
        },
      };

      mailService.loadTemplate.mockResolvedValue('Mocked HTML for new message');

      await createNotification(
        mockIo,
        notificationData.userId,
        notificationData.type,
        notificationData.message,
        notificationData.relatedEntityDetails
      );

      expect(mailService.loadTemplate).toHaveBeenCalledWith('newMessageNotification', expect.any(Object));
      expect(mailService.sendEmail).toHaveBeenCalledWith(
        userTwo.email, // User.findById mock should provide this
        expect.stringContaining('New Message on PustakBazzar from User One Test Name'),
        'Mocked HTML for new message'
      );
    });
    
    it('should send email for "order_update" (confirmation) notification type', async () => {
        const notificationData = {
          userId: userTwo._id.toString(),
          type: 'order_update',
          message: 'Your order #ORDER123 has been placed.',
          relatedEntityDetails: {
            entityType: 'Order',
            entityId: 'orderId123',
            isConfirmation: true,
            orderNumber: 'ORDER123',
            orderItemsHtml: '<tr><td>Book</td><td>1</td><td>100</td></tr>',
            subTotal: '100.00',
            shippingFee: '10.00',
            discount: '0.00',
            netTotal: '110.00',
            orderStatus: 'pending'
          },
        };
  
        mailService.loadTemplate.mockResolvedValue('Mocked HTML for order confirmation');
  
        await createNotification(
          mockIo,
          notificationData.userId,
          notificationData.type,
          notificationData.message,
          notificationData.relatedEntityDetails
        );
  
        expect(mailService.loadTemplate).toHaveBeenCalledWith('orderConfirmation', expect.any(Object));
        expect(mailService.sendEmail).toHaveBeenCalledWith(
          userTwo.email,
          'PustakBazzar Order #ORDER123 Confirmed!',
          'Mocked HTML for order confirmation'
        );
      });

      it('should send email for "order_update" (status change) notification type', async () => {
        const notificationData = {
          userId: userTwo._id.toString(),
          type: 'order_update',
          message: 'Your order #ORDER123 status: Shipped.',
          relatedEntityDetails: {
            entityType: 'Order',
            entityId: 'orderId123',
            isConfirmation: false,
            orderNumber: 'ORDER123',
            orderStatus: 'Shipped',
            statusClass: 'status-shipped',
            additionalMessage: 'Your order has been shipped.'
          },
        };
  
        mailService.loadTemplate.mockResolvedValue('Mocked HTML for order status');
  
        await createNotification(
          mockIo,
          notificationData.userId,
          notificationData.type,
          notificationData.message,
          notificationData.relatedEntityDetails
        );
  
        expect(mailService.loadTemplate).toHaveBeenCalledWith('orderStatusUpdate', expect.any(Object));
        expect(mailService.sendEmail).toHaveBeenCalledWith(
          userTwo.email,
          'PustakBazzar Order #ORDER123 Status: Shipped',
          'Mocked HTML for order status'
        );
      });
  });

  describe('Notification API Endpoints', () => {
    let notifId;

    beforeEach(async () => {
      // Create a notification for userOne for testing GET and POST/:id/mark-read
      const res = await createNotification(
        mockIo, // Pass the mockIo here as well
        userOne._id.toString(),
        'general',
        'Test notification for API'
      );
      notifId = res._id.toString();
    });

    describe('GET /api/notifications', () => {
      it('should fetch notifications for the authenticated user', async () => {
        const res = await request(app)
          .get('/api/notifications?page=1&limit=5')
          .set('Authorization', `Bearer ${userOneToken}`);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('notifications');
        expect(Array.isArray(res.body.notifications)).toBe(true);
        expect(res.body.notifications.length).toBe(1);
        expect(res.body.notifications[0].message).toBe('Test notification for API');
        expect(res.body).toHaveProperty('unreadCount', 1); // Initially unread
      });

      it('should fail if not authenticated', async () => {
        const res = await request(app).get('/api/notifications');
        expect(res.statusCode).toEqual(401);
      });
    });

    describe('POST /api/notifications/:id/mark-read', () => {
      it('should mark a specific notification as read', async () => {
        const res = await request(app)
          .post(`/api/notifications/${notifId}/mark-read`)
          .set('Authorization', `Bearer ${userOneToken}`);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.notification.isRead).toBe(true);

        const dbNotif = await Notification.findById(notifId);
        expect(dbNotif.isRead).toBe(true);

        expect(mockIo.to).toHaveBeenCalledWith(userOne._id.toString());
        expect(mockIo.emit).toHaveBeenCalledWith('notificationRead', { notificationId: notifId, isRead: true });
        expect(mockIo.emit).toHaveBeenCalledWith('unreadNotificationCount', { count: 0 });
      });

      it('should return 404 if notification not found or not owned by user', async () => {
        const otherUsersNotif = await createNotification(mockIo, userTwo._id.toString(), 'general', 'Other user notif');
        
        const res = await request(app)
          .post(`/api/notifications/${otherUsersNotif._id}/mark-read`)
          .set('Authorization', `Bearer ${userOneToken}`);
        expect(res.statusCode).toEqual(404);
      });
    });

    describe('POST /api/notifications/mark-all-read', () => {
      it('should mark all unread notifications as read for the user', async () => {
        // Create another unread notification for userOne
        await createNotification(mockIo, userOne._id.toString(), 'general', 'Another unread');
        
        const res = await request(app)
          .post('/api/notifications/mark-all-read')
          .set('Authorization', `Bearer ${userOneToken}`);
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toContain('notifications marked as read');
        
        const unreadNotifications = await Notification.countDocuments({ user: userOne._id, isRead: false });
        expect(unreadNotifications).toBe(0);

        expect(mockIo.to).toHaveBeenCalledWith(userOne._id.toString());
        expect(mockIo.emit).toHaveBeenCalledWith('allNotificationsRead', { userId: userOne._id.toString() });
        expect(mockIo.emit).toHaveBeenCalledWith('unreadNotificationCount', { count: 0 });
      });
    });
  });
});
