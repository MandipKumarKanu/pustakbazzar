import React, { useState, useCallback } from 'react';
import ConversationList from '@/components/seller/ConversationList';
import SellerChatView from '@/components/seller/SellerChatView';
import useAuthStore from '@/stores/authStore';
import { Navigate } from 'react-router-dom';

const SellerChatPage = () => {
  const [selectedConversation, setSelectedConversation] = useState({
    otherUserId: null,
    bookId: null,
    otherUserName: null,
    bookTitle: null,
  });
  const { user, role } = useAuthStore();

  const handleSelectConversation = useCallback((otherUserId, bookId, otherUserName, bookTitle) => {
    setSelectedConversation({
      otherUserId,
      bookId,
      otherUserName,
      bookTitle,
    });
  }, []);

  if (!user || role !== 'seller') {
    // Redirect to login or home if not a logged-in seller
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] bg-gray-100"> {/* Adjust height based on your header/navbar */}
      <div className="w-1/3 lg:w-1/4 h-full">
        <ConversationList 
          onSelectConversation={handleSelectConversation}
          selectedConversation={selectedConversation} // Pass the whole object
        />
      </div>
      <div className="w-2/3 lg:w-3/4 h-full">
        <SellerChatView
          key={selectedConversation.otherUserId + (selectedConversation.bookId || '')} // Re-mount component when selection changes
          otherUserId={selectedConversation.otherUserId}
          otherUserName={selectedConversation.otherUserName}
          bookId={selectedConversation.bookId}
          bookTitle={selectedConversation.bookTitle}
        />
      </div>
    </div>
  );
};

export default SellerChatPage;
