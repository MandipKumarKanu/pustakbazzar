import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sendMessage, getChatHistory, markMessagesAsRead } from '../api/chat';
import useAuthStore from '../stores/authStore';
import { useSocket } from '../context/SocketContext'; // Import useSocket
import { FaPaperPlane, FaSpinner, FaTimes, FaCommentDots } from 'react-icons/fa';

const ChatModal = ({ sellerId, sellerName, bookId, bookTitle, isOpen, onClose }) => {
  const { user } = useAuthStore();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const chatBodyRef = useRef(null);

  const handleMarkMessagesAsRead = useCallback(async () => {
    if (!user || !sellerId || !bookId || !isOpen) return; 
    try {
      await markMessagesAsRead(sellerId, bookId); 
       setMessages(prev => prev.map(msg => 
        (msg.receiverId === user.id || msg.receiverId?._id === user.id) && 
        (msg.senderId === sellerId || msg.senderId?._id === sellerId) && !msg.read
        ? { ...msg, read: true } 
        : msg
      ));
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [user, sellerId, bookId, isOpen]);

  const loadChatHistory = useCallback(async (currentPage) => {
    if (!user || !sellerId || !bookId) return;
    setIsLoading(true);
    setError(null);
    try {
      const history = await getChatHistory(sellerId, bookId, currentPage, 20);
      setMessages((prevMessages) =>
        currentPage === 1 ? history.reverse() : [...history.reverse(), ...prevMessages]
      );
      setHasMore(history.length === 20);
      if (currentPage === 1 && history.length > 0) {
        handleMarkMessagesAsRead();
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
      setError('Failed to load messages.');
    } finally {
      setIsLoading(false);
    }
  }, [user, sellerId, bookId, handleMarkMessagesAsRead]);

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setMessages([]);
      setHasMore(true);
      loadChatHistory(1);
    } else {
      setIsTyping(false);
      if (socket && sellerId && user) {
        socket.emit('stopTyping', { receiverId: sellerId, senderId: user.id });
      }
    }
  }, [isOpen, sellerId, bookId, user, loadChatHistory, socket]);

  // Scroll to bottom logic
  useEffect(() => {
    if (chatBodyRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatBodyRef.current;
      // Scroll down if user is near the bottom or it's an initial load/new message from self
      if (scrollHeight - scrollTop <= clientHeight + 200 || messages.length <= 20 || isSending) {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
      }
    }
  }, [messages, isOpen, isSending]);


  // Socket event listeners
  // Socket event listeners
  // Socket event listeners
  useEffect(() => {
    if (!socket || !isOpen || !user) return;

    const handleNewMessage = (receivedMessage) => {
      if (
        receivedMessage.bookId?._id === bookId &&
        ((receivedMessage.senderId?._id === sellerId && receivedMessage.receiverId?._id === user.id) ||
         (receivedMessage.senderId?._id === user.id && receivedMessage.receiverId?._id === sellerId))
      ) {
        setMessages((prevMessages) => {
          if (prevMessages.find(msg => msg._id === receivedMessage._id)) {
            return prevMessages.map(msg => msg._id === receivedMessage._id ? receivedMessage : msg); 
          }
          return [...prevMessages, receivedMessage];
        });
        if (receivedMessage.senderId?._id === sellerId && document.visibilityState === 'visible') {
          handleMarkMessagesAsRead();
        }
      }
    };

    const handleMessagesRead = ({ readerId, bookId: readBookId }) => { // Removed messageIds from params
      if (readerId === sellerId && readBookId === bookId) {
        setMessages(prev => prev.map(msg => 
          (msg.senderId === user.id || msg.senderId?._id === user.id) && !msg.read 
          ? { ...msg, read: true } // Mark all unread sent messages as read
          : msg
        ));
      }
    };
    
    const handleMessagesReadByMe = ({ otherUserId, bookId: readBookId }) => {
        if (otherUserId === sellerId && readBookId === bookId) {
             setMessages(prev => prev.map(msg => 
                (msg.receiverId === user.id || msg.receiverId?._id === user.id) && 
                (msg.senderId === sellerId || msg.senderId?._id === sellerId) && !msg.read
                ? { ...msg, read: true } 
                : msg
            ));
        }
    };

    const handleTypingEvent = ({ senderId: typingSenderId }) => {
      if (typingSenderId === sellerId) setIsTyping(true);
    };

    const handleStopTypingEvent = ({ senderId: stopTypingSenderId }) => {
      if (stopTypingSenderId === sellerId) setIsTyping(false);
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('messagesRead', handleMessagesRead);
    socket.on('messagesReadByMe', handleMessagesReadByMe);
    socket.on('typing', handleTypingEvent);
    socket.on('stopTyping', handleStopTypingEvent);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messagesRead', handleMessagesRead);
      socket.off('messagesReadByMe', handleMessagesReadByMe);
      socket.off('typing', handleTypingEvent);
      socket.off('stopTyping', handleStopTypingEvent);
    };
  }, [socket, isOpen, sellerId, bookId, user, handleMarkMessagesAsRead]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !sellerId) return;

    setIsSending(true);
    setError(null);
    try {
      await sendMessage(sellerId, bookId, newMessage.trim()); 
      setNewMessage('');
      if (socket) {
        socket.emit('stopTyping', { receiverId: sellerId, senderId: user.id });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (!socket || !user || !sellerId) return;

    if (value && !isSending) {
      socket.emit('typing', { receiverId: sellerId, senderId: user.id });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (socket) socket.emit('stopTyping', { receiverId: sellerId, senderId: user.id });
      }, 3000);
    } else {
      clearTimeout(typingTimeoutRef.current);
      if (socket) socket.emit('stopTyping', { receiverId: sellerId, senderId: user.id });
    }
  };

  const handleScroll = useCallback(() => {
    if (chatBodyRef.current && chatBodyRef.current.scrollTop === 0 && hasMore && !isLoading) {
      const oldScrollHeight = chatBodyRef.current.scrollHeight;
      const nextPage = page + 1;
      setPage(nextPage);
      loadChatHistory(nextPage).then(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight - oldScrollHeight;
        }
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md md:max-w-lg flex flex-col" style={{ height: 'calc(100vh - 4rem)', maxHeight: '700px' }}>
        <div className="p-3 sm:p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
          <div className="truncate">
            <h3 className="text-md sm:text-lg font-semibold truncate" title={`Chat with ${sellerName}`}>Chat with {sellerName}</h3>
            {bookTitle && <p className="text-xs sm:text-sm text-gray-600 truncate" title={`Regarding: ${bookTitle}`}>Regarding: {bookTitle}</p>}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200">
            <FaTimes size={20} />
          </button>
        </div>

        <div 
          ref={chatBodyRef} 
          className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto"
          onScroll={handleScroll}
        >
          {isLoading && messages.length === 0 && (
            <div className="flex justify-center items-center h-full">
              <FaSpinner className="animate-spin text-blue-500" size={24} />
              <p className="ml-2">Loading messages...</p>
            </div>
          )}
           {isLoading && messages.length > 0 && ( 
            <div className="flex justify-center py-2">
              <FaSpinner className="animate-spin text-blue-500" size={18} />
            </div>
          )}
          {!hasMore && messages.length > 0 && (
            <p className="text-center text-xs text-gray-400 py-1">No older messages.</p>
          )}
          {messages.map((msg) => (
            <div
              key={msg._id || msg.timestamp} 
              className={`flex ${
                msg.senderId?._id === user?.id || msg.senderId === user?.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] sm:max-w-[70%] px-3 py-2 rounded-xl shadow-sm ${
                  msg.senderId?._id === user?.id || msg.senderId === user?.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                <div className={`text-xs mt-1 flex items-center ${
                  msg.senderId?._id === user?.id || msg.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                } justify-end`}>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {(msg.senderId?._id === user?.id || msg.senderId === user?.id) && msg.read && (
                     <span className="ml-1 text-blue-100">✓✓</span> 
                  )}
                   {(msg.senderId?._id === user?.id || msg.senderId === user?.id) && !msg.read && (
                     <span className="ml-1 text-blue-100">✓</span> 
                  )}
                </p>
              </div>
            </div>
          ))}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </div>

        <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t bg-gray-50 rounded-b-lg">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange} 
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-l-md focus:ring-blue-500 focus:border-blue-500"
              disabled={isSending}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2.5 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center w-12 h-10 sm:w-14 sm:h-11 transition-colors"
              disabled={isSending || !newMessage.trim()}
            >
              {isSending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
