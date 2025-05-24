const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'; // Fallback for local dev

/**
 * Generates a direct link to a chat.
 * This is a placeholder. Actual implementation might depend on how your frontend handles chat routing.
 * It might involve senderId, receiverId, or a specific chatId/bookId.
 * @param {string} otherUserId - The ID of the other user in the chat.
 * @param {string} [bookId] - Optional book ID if the chat is about a specific book.
 * @returns {string} The deep link to the chat.
 */
const generateChatLink = (otherUserId, bookId) => {
  if (bookId) {
    // If chat is specific to a book and user, the link might point to the book,
    // and the frontend ChatModal opens with this context.
    // Or, it might be a direct link to a seller's message page with specific query params.
    return `${FRONTEND_URL}/book/${bookId}?chatWith=${otherUserId}`; // Example
  }
  // If no bookId, it might be a general messages page filtered by user.
  // This depends heavily on frontend routing for messages/chat.
  return `${FRONTEND_URL}/admin/messages?userId=${otherUserId}`; // Example for seller dashboard context
  // For a general user, it might be /profile/messages?userId=...
};

/**
 * Generates a link to the order details page.
 * @param {string} orderId - The ID of the order.
 * @returns {string} The deep link to the order details.
 */
const generateOrderDetailsLink = (orderId) => {
  return `${FRONTEND_URL}/my-orders?orderId=${orderId}`; // Adjust if your route is different, e.g., /orders/${orderId}
};

/**
 * Generates a link to the donation details page or user's donation list.
 * @param {string} donationId - The ID of the donation.
 * @returns {string} The deep link to the donation details.
 */
const generateDonationDetailsLink = (donationId) => {
  // Assuming a user profile page with a tab for donations, or a specific donation page
  return `${FRONTEND_URL}/profile?tab=donations&donationId=${donationId}`; 
};

/**
 * Generates a link to the seller dashboard.
 * @returns {string} The deep link to the seller dashboard.
 */
const generateSellerDashboardLink = () => {
  return `${FRONTEND_URL}/admin/home`; // Or a more specific seller page like /admin/profile
};

/**
 * Generates a link to a book details page.
 * @param {string} bookId - The ID of the book.
 * @returns {string} The deep link to the book details.
 */
const generateBookLink = (bookId) => {
  return `${FRONTEND_URL}/book/${bookId}`;
};


module.exports = {
  generateChatLink,
  generateOrderDetailsLink,
  generateDonationDetailsLink,
  generateSellerDashboardLink,
  generateBookLink,
  FRONTEND_URL, // Export for other uses if necessary
};
