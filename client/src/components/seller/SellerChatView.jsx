import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sendMessage, getChatHistory, markMessagesAsRead } from '@/api/chat';
import useAuthStore from '@/stores/authStore';
import { useSocket } from '@/context/SocketContext'; // Import useSocket
import { FaPaperPlane, FaSpinner, FaUserCircle, FaBook, FaCommentDots } from 'react-icons/fa'; // Added FaCommentDots
import { format } from 'date-fns';

const SellerChatView = ({ otherUserId, otherUserName, bookId, bookTitle }) => {
  const { user } = useAuthStore();
  const { socket } = useSocket(); // Get socket instance
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
    if (!user || !otherUserId) return;
    try {
      await markMessagesAsRead(otherUserId, bookId); 
      setMessages(prev => prev.map(msg => 
        (msg.receiverId === user.id || msg.receiverId?._id === user.id) && 
        (msg.senderId === otherUserId || msg.senderId?._id === otherUserId) && !msg.read
        ? { ...msg, read: true } 
        : msg
      ));
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [user, otherUserId, bookId]);

  const loadChatHistory = useCallback(async (currentPage, isInitialLoad = false) => {
    if (!user || !otherUserId) return;
    setIsLoading(true);
    setError(null);
    try {
      const history = await getChatHistory(otherUserId, bookId, currentPage, 20);
      setMessages((prevMessages) =>
        currentPage === 1 ? history.reverse() : [...history.reverse(), ...prevMessages]
      );
      setHasMore(history.length === 20);
      if (isInitialLoad && history.length > 0) {
        handleMarkMessagesAsRead();
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
      setError('Failed to load messages.');
    } finally {
      setIsLoading(false);
    }
  }, [user, otherUserId, bookId, handleMarkMessagesAsRead]);

  useEffect(() => {
    if (otherUserId) {
      setPage(1);
      setMessages([]);
      setHasMore(true);
      loadChatHistory(1, true);
    } else {
      setMessages([]);
      setIsTyping(false); 
    }
    return () => {
        clearTimeout(typingTimeoutRef.current);
    };
  }, [otherUserId, bookId, user, loadChatHistory]);

  // Scroll to bottom logic
  useEffect(() => {
    if (chatBodyRef.current) {
      if (page === 1 || messages.length <= 20 || isSending) {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
      } else if (isLoading && page > 1) {
        const oldScrollHeight = chatBodyRef.current.scrollHeight;
        requestAnimationFrame(() => {
          if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight - oldScrollHeight;
          }
        });
      }
    }
  }, [messages, isLoading, page, isSending]);

  // Socket event listeners
  // Socket event listeners
  useEffect(() => {
    if (!socket || !user || !otherUserId) return;

    const handleNewMessage = (receivedMessage) => {
      if (
        (receivedMessage.bookId?._id === bookId || (!receivedMessage.bookId && !bookId)) && // Match if both bookId are null/undefined, or if they match
        ((receivedMessage.senderId?._id === otherUserId && receivedMessage.receiverId?._id === user.id) ||
         (receivedMessage.senderId?._id === user.id && receivedMessage.receiverId?._id === otherUserId))
      ) {
        setMessages((prevMessages) => {
           if (prevMessages.find(msg => msg._id === receivedMessage._id)) {
             return prevMessages.map(msg => msg._id === receivedMessage._id ? receivedMessage : msg);
           }
           return [...prevMessages, receivedMessage];
        });
        if (receivedMessage.senderId?._id === otherUserId && document.visibilityState === 'visible') {
          handleMarkMessagesAsRead();
        }
      }
    };

    const handleMessagesRead = ({ readerId, bookId: readBookId, messageIds }) => {
      if (readerId === otherUserId && (readBookId === bookId || (!readBookId && !bookId)) ) {
        setMessages(prev => prev.map(msg => 
          (msg.senderId === user.id || msg.senderId?._id === user.id) && !msg.read 
          ? (messageIds ? messageIds.includes(msg._id) : true) ? { ...msg, read: true } : msg
          : msg
        ));
      }
    };

    const handleMessagesReadByMe = ({ otherUserId: eventOtherUserId, bookId: readBookId }) => {
        if (eventOtherUserId === otherUserId && (readBookId === bookId || (!readBookId && !bookId))) {
             setMessages(prev => prev.map(msg => 
                (msg.receiverId === user.id || msg.receiverId?._id === user.id) && 
                (msg.senderId === otherUserId || msg.senderId?._id === otherUserId) && !msg.read
                ? { ...msg, read: true } 
                : msg
            ));
        }
    };

    const handleTypingEvent = ({ senderId: typingSenderId }) => {
      if (typingSenderId === otherUserId) setIsTyping(true);
    };

    const handleStopTypingEvent = ({ senderId: stopTypingSenderId }) => {
      if (stopTypingSenderId === otherUserId) setIsTyping(false);
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
  }, [socket, otherUserId, bookId, user, handleMarkMessagesAsRead]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !otherUserId) return;

    setIsSending(true);
    setError(null);
    try {
      await sendMessage(otherUserId, bookId, newMessage.trim());
      setNewMessage('');
      if (socket) {
        socket.emit('stopTyping', { receiverId: otherUserId, senderId: user.id });
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

    if (!socket || !user || !otherUserId) return;

    if (value && !isSending) {
      socket.emit('typing', { receiverId: otherUserId, senderId: user.id });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if(socket) socket.emit('stopTyping', { receiverId: otherUserId, senderId: user.id });
      }, 3000);
    } else {
      clearTimeout(typingTimeoutRef.current);
      if(socket) socket.emit('stopTyping', { receiverId: otherUserId, senderId: user.id });
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

  if (!otherUserId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-gray-50">
        <FaUserCircle className="text-gray-400 text-6xl mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Select a Conversation</h2>
        <p className="text-gray-500">Choose a conversation from the list to start chatting.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{otherUserName || 'Chat'}</h3>
          {bookTitle && (
            <div className="flex items-center text-sm text-gray-600">
              <FaBook className="mr-1.5 text-gray-500" />
              <span>{bookTitle}</span>
            </div>
          )}
        </div>
      </div>

      <div
        ref={chatBodyRef}
        className="flex-1 p-4 space-y-3 overflow-y-auto"
        onScroll={handleScroll}
      >
        {isLoading && messages.length === 0 && (
          <div className="flex justify-center items-center h-full">
            <FaSpinner className="animate-spin text-blue-500 text-2xl" />
            <p className="ml-2 text-gray-600">Loading messages...</p>
          </div>
        )}
        {isLoading && messages.length > 0 && (
          <div className="flex justify-center py-2">
            <FaSpinner className="animate-spin text-blue-500 text-lg" />
          </div>
        )}
        {!hasMore && messages.length > 0 && (
          <p className="text-center text-xs text-gray-400 py-2">No older messages.</p>
        )}

        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${
              msg.senderId?._id === user?.id || msg.senderId === user?.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md lg:max-w-lg px-3.5 py-2.5 rounded-xl shadow-sm ${
                msg.senderId?._id === user?.id || msg.senderId === user?.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              <div className={`text-xs mt-1.5 flex items-center ${
                msg.senderId?._id === user?.id || msg.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
              } justify-end`}>
                <span>{format(new Date(msg.timestamp), 'p')}</span>
                {(msg.senderId?._id === user?.id || msg.senderId === user?.id) && msg.read && (
                  <span className="ml-1">✓✓</span> // Double tick for read
                )}
                {(msg.senderId?._id === user?.id || msg.senderId === user?.id) && !msg.read && (
                  <span className="ml-1">✓</span> // Single tick for sent/delivered
                )}
              </p>
            </div>
          </div>
        ))}
        {error && <p className="text-red-500 text-sm text-center py-2">{error}</p>}
      </div>

      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange} // Changed to handleInputChange for typing events
            placeholder="Type your message..."
            className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
            disabled={isSending || !otherUserId}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2.5 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center w-14 h-11 transition-colors"
            disabled={isSending || !newMessage.trim() || !otherUserId}
          >
            {isSending ? <FaSpinner className="animate-spin text-xl" /> : <FaPaperPlane className="text-xl" />}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SellerChatView;
