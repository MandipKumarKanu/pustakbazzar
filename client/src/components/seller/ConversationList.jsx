import React, { useEffect, useState, useCallback } from 'react';
import { getConversations } from '@/api/chat';
import useAuthStore from '@/stores/authStore';
import { useSocket } from '@/context/SocketContext'; // Import useSocket
import { FaSpinner, FaUserCircle, FaBook } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const ConversationList = ({ onSelectConversation, selectedConversation }) => { // Changed prop name
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();
  const { socket } = useSocket();

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const convs = await getConversations();
      convs.sort((a, b) => new Date(b.lastMessageTimestamp) - new Date(a.lastMessageTimestamp));
      setConversations(convs);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!socket || !user) return;

    const handleNewMessage = (newMessage) => {
      setConversations(prevConvs => {
        let conversationExists = false;
        const updatedConvs = prevConvs.map(conv => {
          if (conv.otherUserId === newMessage.senderId?._id || conv.otherUserId === newMessage.receiverId?._id) {
            conversationExists = true;
            return {
              ...conv,
              lastMessage: newMessage.content,
              lastMessageTimestamp: newMessage.timestamp,
              // Increment unread count if the message is not from the current user
              // and the conversation (user and book) is not currently selected
              unreadCount: (
                newMessage.senderId?._id !== user.id &&
                !(conv.otherUserId === selectedConversation?.otherUserId &&
                  (conv.bookId || null) === (selectedConversation?.bookId || null))
              ) ? (conv.unreadCount || 0) + 1 : conv.unreadCount,
              bookId: newMessage.bookId?._id || conv.bookId,
              bookTitle: newMessage.bookId?.title || conv.bookTitle,
            };
          }
          return conv;
        });

        if (!conversationExists) {
          // New conversation
          const otherUser = newMessage.senderId?._id === user.id ? newMessage.receiverId : newMessage.senderId;
          if (!otherUser) return updatedConvs; // Should not happen

          const newConv = {
            otherUserId: otherUser._id,
            otherUserName: otherUser.name || 'Unknown User', // Ensure name is available
            lastMessage: newMessage.content,
            lastMessageTimestamp: newMessage.timestamp,
            unreadCount: newMessage.senderId?._id !== user.id ? 1 : 0,
            bookId: newMessage.bookId?._id,
            bookTitle: newMessage.bookId?.title,
          };
          updatedConvs.push(newConv);
        }
        
        return updatedConvs.sort((a, b) => new Date(b.lastMessageTimestamp) - new Date(a.lastMessageTimestamp));
      });
    };

    const handleMessagesReadByMe = ({ otherUserId, bookId: readBookId }) => {
        // When current user reads messages (e.g., in SellerChatView)
        // We need to clear unreadCount for that conversation in this list
        setConversations(prevConvs => 
            prevConvs.map(conv => 
                conv.otherUserId === otherUserId && (conv.bookId === readBookId || !readBookId) // Match bookId if provided
                ? { ...conv, unreadCount: 0 }
                : conv
            )
        );
    };
    
    // This handler is for when the *other* user reads messages sent by the current user.
    // It doesn't directly change unread counts for the current user viewing the list.
    // const handleMessagesRead = ({ readerId, bookId: readBookId }) => {
    //   // console.log('Messages read by other user:', readerId, readBookId);
    // };

    socket.on('newMessage', handleNewMessage);
    socket.on('messagesReadByMe', handleMessagesReadByMe);
    // socket.on('messagesRead', handleMessagesRead);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('messagesReadByMe', handleMessagesReadByMe);
      // socket.off('messagesRead', handleMessagesRead);
    };
  }, [socket, user, selectedConversation]);

  // Effect to visually clear unread count when a conversation is selected.
  // The actual state update of unreadCount for persistence or across sessions
  // is handled by `messagesReadByMe` event or when the chat view marks messages as read.
  useEffect(() => {
    if (selectedConversation?.otherUserId) {
      setConversations(prevConvs =>
        prevConvs.map(conv =>
          conv.otherUserId === selectedConversation.otherUserId &&
          (conv.bookId || null) === (selectedConversation.bookId || null)
            ? { ...conv, unreadCount: 0 } // Visually clear, backend will confirm actual read status
            : conv
        )
      );
    }
  }, [selectedConversation]);

  if (isLoading && conversations.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <FaSpinner className="animate-spin text-blue-500 text-3xl mb-3" />
        <p className="text-gray-600">Loading conversations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchConversations}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <FaUserCircle className="text-gray-400 text-5xl mb-3" />
        <p className="text-gray-600">No conversations yet.</p>
        <p className="text-sm text-gray-500">Messages from buyers will appear here.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto border-r border-gray-200 bg-gray-50">
      <div className="p-3.5 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
      </div>
      <ul className="divide-y divide-gray-200">
        {conversations.map((conv) => {
          const isSelected =
            conv.otherUserId === selectedConversation?.otherUserId &&
            (conv.bookId || null) === (selectedConversation?.bookId || null);

          return (
            <li
              key={conv.otherUserId + (conv.bookId || '')}
              onClick={() => onSelectConversation(conv.otherUserId, conv.bookId, conv.otherUserName, conv.bookTitle)}
              className={`p-3.5 transition-colors duration-150 ease-in-out cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-r-4 border-blue-500'
                  : 'hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <h3 className={`font-semibold text-sm truncate ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                  {conv.otherUserName || 'Unknown User'}
                </h3>
                {conv.unreadCount > 0 && (
                  <span className={`text-white text-xs font-semibold rounded-full px-2 py-0.5 ${isSelected ? 'bg-blue-500' : 'bg-red-500'}`}>
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              {conv.bookTitle && (
                <div className={`flex items-center text-xs mt-0.5 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                  <FaBook className="mr-1.5 flex-shrink-0" />
                  <span className="truncate" title={conv.bookTitle}>{conv.bookTitle}</span>
                </div>
              )}
              <p className={`text-xs mt-1 truncate ${
                conv.unreadCount > 0 && !isSelected ? 'font-bold text-gray-700' : (isSelected ? 'text-gray-600' : 'text-gray-500')
              }`}>
                {conv.lastMessage}
              </p>
              <p className={`text-xs mt-1 text-right ${isSelected ? 'text-gray-500' : 'text-gray-400'}`}>
                {formatDistanceToNow(new Date(conv.lastMessageTimestamp), { addSuffix: true })}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ConversationList;
