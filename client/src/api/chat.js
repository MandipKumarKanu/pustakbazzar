import axios from './axios';

export const sendMessage = async (receiverId, bookId, content) => {
  const { data } = await axios.post('/chat/send', {
    receiverId,
    bookId,
    content,
  });
  return data;
};

export const getChatHistory = async (otherUserId, bookId, page = 1, limit = 20) => {
  const params = { page, limit };
  if (bookId) {
    params.bookId = bookId;
  }
  const { data } = await axios.get(`/chat/history/${otherUserId}`, { params });
  return data;
};

export const markMessagesAsRead = async (senderId) => {
  const { data } = await axios.put('/chat/messages/mark-as-read', { senderId });
  return data;
};

export const getConversations = async () => {
  const { data } = await axios.get('/chat/conversations');
  return data;
};
