import axios from './axios'; // Assuming your configured axios instance is here

/**
 * Fetches notifications for the authenticated user.
 * @param {number} [page=1] - The page number to fetch.
 * @param {number} [limit=10] - The number of notifications per page.
 * @returns {Promise<Object>} The API response containing notifications and pagination info.
 */
export const getNotifications = async (page = 1, limit = 10) => {
  const { data } = await axios.get('/notifications', {
    params: { page, limit },
  });
  return data;
};

/**
 * Marks a single notification as read.
 * @param {string} notificationId - The ID of the notification to mark as read.
 * @returns {Promise<Object>} The API response.
 */
export const markNotificationAsRead = async (notificationId) => {
  if (!notificationId) {
    throw new Error('Notification ID is required.');
  }
  const { data } = await axios.post(`/notifications/${notificationId}/mark-read`);
  return data;
};

/**
 * Marks all unread notifications for the authenticated user as read.
 * @returns {Promise<Object>} The API response.
 */
export const markAllNotificationsAsRead = async () => {
  const { data } = await axios.post('/notifications/mark-all-read');
  return data;
};
