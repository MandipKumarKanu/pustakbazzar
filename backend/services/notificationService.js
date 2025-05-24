const Notification = require('../models/Notification');
const User = require('../models/User'); // Needed to get user's email and name
const mailService = require('./mailService'); // Import mailService
const { generateChatLink, generateOrderDetailsLink, generateDonationDetailsLink, generateSellerDashboardLink } = require('../utils/linkGenerator'); // Assuming a utility for deep links

/**
 * Creates a new notification, emits a socket event, and sends an email for certain types.
 *
 * @param {Object} io - The Socket.IO instance.
 * @param {string} userId - The ID of the user to notify.
 * @param {string} type - The type of notification (e.g., 'new_message', 'order_update').
 * @param {string} message - The notification message.
 * @param {Object} [relatedEntityDetails] - Optional details about the related entity.
 * @param {string} [relatedEntityDetails.entityType] - The type of the related entity (e.g., 'Chat', 'Order').
 * @param {string} [relatedEntityDetails.entityId] - The ID of the related entity.
 * @returns {Promise<Notification>} The created notification document.
 */
const createNotification = async (io, userId, type, message, relatedEntityDetails = {}) => {
  try {
    if (!userId || !type || !message) {
      throw new Error('Missing required fields for notification (userId, type, message).');
    }

    const notificationData = {
      user: userId,
      type,
      message,
    };

    if (relatedEntityDetails.entityType && relatedEntityDetails.entityId) {
      notificationData.relatedEntity = {
        entityType: relatedEntityDetails.entityType,
        entityId: relatedEntityDetails.entityId,
      };
    }

    const newNotification = new Notification(notificationData);
    await newNotification.save();
    
    if (io && userId) {
        io.to(userId.toString()).emit('newNotification', newNotification);
        console.log(`Emitted 'newNotification' to user room: ${userId.toString()}`);
    } else {
        if (!io) console.warn('Socket.IO instance not provided to createNotification for socket emission.');
        if (!userId) console.warn('UserId not provided to createNotification for socket emission.');
    }

    // Send email based on notification type
    try {
      const user = await User.findById(userId).select('email name profile.name').lean();
      if (!user || !user.email) {
        console.warn(`User or user email not found for userId: ${userId}. Email not sent.`);
        return newNotification; // Still return the notification
      }
      
      const userName = user.profile?.name || user.name || 'User';
      const currentYear = new Date().getFullYear();
      let emailHtmlContent;
      let emailSubject;

      switch (type) {
        case 'new_message':
          // For new_message, the 'message' field in createNotification is the notification message.
          // We might need more context like senderName and messagePreview if they are not in 'message'.
          // Assuming 'message' is like "You have a new message from SenderName regarding BookTitle"
          // and relatedEntityDetails contains senderName, messagePreview, bookContext.
          // The 'message' param for createNotification should be the core text like "Check your new message"
          // and additional details passed in relatedEntityDetails.
          // For now, let's assume 'message' in createNotification is the email body intro.
          
          // The 'message' param for createNotification: "You have a new message from ${senderName} regarding ${bookTitle}"
          // relatedEntityDetails: { senderName, messagePreview, bookId, originalSenderId }
          emailSubject = `New Message on PustakBazzar from ${relatedEntityDetails.senderName || 'a user'}`;
          emailHtmlContent = await mailService.loadTemplate('newMessageNotification', {
            '{{userName}}': userName,
            '{{senderName}}': relatedEntityDetails.senderName || 'A user',
            '{{bookContext}}': relatedEntityDetails.bookTitle ? ` regarding "${relatedEntityDetails.bookTitle}"` : '',
            '{{messagePreview}}': relatedEntityDetails.messagePreview || message.split('. ')[0], // Use provided preview or first part of notification message
            '{{chatLink}}': generateChatLink(relatedEntityDetails.originalSenderId, relatedEntityDetails.bookId), // Use original sender for chat link
            '{{currentYear}}': currentYear,
          });
          await mailService.sendEmail(user.email, emailSubject, emailHtmlContent);
          break;

        case 'order_update':
          // The 'message' for createNotification: "Your order #XYZ status: Shipped"
          // relatedEntityDetails: { orderNumber, orderStatus, orderDetailsLink, statusClass, additionalMessage (for email) }
          emailSubject = `PustakBazzar Order #${relatedEntityDetails.orderNumber} Status: ${relatedEntityDetails.orderStatus}`;
          if (relatedEntityDetails.isConfirmation) { // Special case for initial order confirmation
            emailSubject = `PustakBazzar Order #${relatedEntityDetails.orderNumber} Confirmed!`;
            emailHtmlContent = await mailService.loadTemplate('orderConfirmation', {
              '{{userName}}': userName,
              '{{orderNumber}}': relatedEntityDetails.orderNumber,
              '{{orderItems}}': relatedEntityDetails.orderItemsHtml, // HTML string of table rows
              '{{subTotal}}': relatedEntityDetails.subTotal,
              '{{shippingFee}}': relatedEntityDetails.shippingFee,
              '{{discount}}': relatedEntityDetails.discount,
              '{{netTotal}}': relatedEntityDetails.netTotal,
              '{{orderDetailsLink}}': generateOrderDetailsLink(relatedEntityDetails.entityId),
              '{{currentYear}}': currentYear,
            });
          } else {
            emailHtmlContent = await mailService.loadTemplate('orderStatusUpdate', {
              '{{userName}}': userName,
              '{{orderNumber}}': relatedEntityDetails.orderNumber,
              '{{orderStatus}}': relatedEntityDetails.orderStatus,
              '{{statusClass}}': relatedEntityDetails.statusClass || 'status-default', // e.g. 'status-shipped'
              '{{additionalMessage}}': relatedEntityDetails.additionalMessage || '', // For tracking, cancellation reason etc.
              '{{orderDetailsLink}}': generateOrderDetailsLink(relatedEntityDetails.entityId),
              '{{currentYear}}': currentYear,
            });
          }
          await mailService.sendEmail(user.email, emailSubject, emailHtmlContent);
          break;
          
        case 'seller_status':
          // message: "Congratulations! Your seller application has been approved."
          // relatedEntityDetails: { applicationStatus (approved/rejected), statusClass (CSS class), dashboardLinkHtml }
          emailSubject = `PustakBazzar Seller Application: ${relatedEntityDetails.applicationStatus}`;
          emailHtmlContent = await mailService.loadTemplate('sellerApplicationStatus', {
            '{{userName}}': userName,
            '{{applicationStatus}}': relatedEntityDetails.applicationStatus,
            '{{statusClass}}': relatedEntityDetails.statusClass,
            '{{additionalMessage}}': relatedEntityDetails.emailBodyMessage || message, // Use specific email body or fallback to in-app message
            '{{dashboardLink}}': relatedEntityDetails.dashboardLinkHtml || `<p><a href="${generateSellerDashboardLink()}" class="button">Go to Dashboard</a></p>`,
            '{{currentYear}}': currentYear,
          });
          await mailService.sendEmail(user.email, emailSubject, emailHtmlContent);
          break;

        case 'donation_status':
          emailSubject = `PustakBazzar Donation Update: ${relatedEntityDetails.bookTitle}`;
          emailHtmlContent = await mailService.loadTemplate('donationStatusUpdate', {
            '{{userName}}': userName,
            '{{bookTitle}}': relatedEntityDetails.bookTitle,
            '{{donationStatus}}': relatedEntityDetails.donationStatus,
            '{{statusClass}}': relatedEntityDetails.statusClass,
            '{{additionalMessage}}': relatedEntityDetails.emailBodyMessage || message, // Use specific email body or fallback to in-app message
            '{{donationDetailsLink}}': generateDonationDetailsLink(relatedEntityDetails.entityId),
            '{{currentYear}}': currentYear,
          });
          await mailService.sendEmail(user.email, emailSubject, emailHtmlContent);
          break;
        // Add more cases as needed
      }
    } catch (emailError) {
      console.error(`Failed to send email for notification type ${type}, user ${userId}:`, emailError);
      // Do not let email failure stop notification creation/socket emission
    }

    return newNotification;
  } catch (error) {
    console.error('Error creating notification (outer):', error.message);
    return null;
  }
};

module.exports = {
  createNotification,
};
