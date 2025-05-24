import React from 'react';
import { useNotification } from '@/context/NotificationContext';
import { FaBellSlash, FaCheckDouble, FaSpinner, FaInbox } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area'; // Assuming you have a ScrollArea component
import { Button } from '@/components/ui/button'; // Assuming you have a Button component

// Helper to get navigation path (simplified version, expand as needed)
const getNavigationPath = (relatedEntity) => {
  if (!relatedEntity || !relatedEntity.entityType || !relatedEntity.entityId) {
    return null;
  }
  switch (relatedEntity.entityType) {
    case 'Order':
      return `/my-orders?orderId=${relatedEntity.entityId}`; // Or your specific order detail page
    case 'Chat':
      // This is more complex. Chat navigation might need sender/receiver ID or a chat ID.
      // For now, let's assume entityId for chat notifications might be the other user's ID or book ID.
      // This needs to be aligned with how backend creates 'Chat' relatedEntity.
      // Example: navigate to a generic messages page or a specific chat if possible.
      // If entityId is a bookId, maybe navigate to the book:
      // return `/book/${relatedEntity.entityId}`; 
      // If entityId is otherUserId for a chat:
      // return `/admin/messages?userId=${relatedEntity.entityId}`; // This is a guess for seller dashboard
      return '/admin/messages'; // General link for now
    case 'Donation':
      return `/profile?tab=donations`; // Or a specific donation detail page
    case 'Book':
      return `/book/${relatedEntity.entityId}`;
    case 'User': // e.g., seller approval
      return `/profile`;
    default:
      return null;
  }
};

const NotificationsPanel = ({ onClose }) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    totalPages,
    currentPage,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotification();
  const navigate = useNavigate();

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    const path = getNavigationPath(notification.relatedEntity);
    if (path) {
      navigate(path);
    }
    onClose(); // Close panel after click
  };

  return (
    <div className="w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col max-h-[calc(100vh-100px)] sm:max-h-[600px]">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
        {unreadCount > 0 && (
          <Button
            variant="link"
            size="sm"
            onClick={markAllAsRead}
            disabled={isLoading}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading && notifications.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <FaSpinner className="animate-spin text-blue-500 text-2xl" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <FaBellSlash className="text-gray-400 text-4xl mb-3" />
          <p className="text-gray-600 font-medium">No notifications yet.</p>
          <p className="text-sm text-gray-500">We'll let you know when something new happens.</p>
        </div>
      ) : (
        <ScrollArea className="flex-1 overflow-y-auto"> {/* Make this part scrollable */}
          <ul className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <li
                key={notification._id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-3 hover:bg-gray-50 cursor-pointer ${
                  !notification.isRead ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  {!notification.isRead && (
                     <span className="mt-1.5 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" title="Unread"></span>
                  )}
                   <div className={`flex-1 ${notification.isRead ? 'pl-5' : ''}`}> {/* Add padding if read dot is not there */}
                    <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-800' : 'text-gray-700'}`}>
                      {notification.message}
                    </p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                      {!notification.isRead && (
                        <Button
                          variant="outline"
                          size="xs" // Custom size or adjust padding
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent li click
                            markAsRead(notification._id);
                          }}
                          className="text-xs px-2 py-0.5 h-auto border-gray-300 hover:bg-gray-100"
                        >
                          Mark read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {currentPage < totalPages && !isLoading && (
            <div className="p-3 border-t border-gray-200 text-center">
              <Button
                variant="link"
                onClick={loadMoreNotifications}
                className="text-blue-600 hover:text-blue-800"
              >
                Load More
              </Button>
            </div>
          )}
          {isLoading && notifications.length > 0 && (
             <div className="flex justify-center p-3">
                <FaSpinner className="animate-spin text-blue-500 text-xl" />
             </div>
          )}
        </ScrollArea>
      )}
       <div className="p-2 border-t border-gray-200 text-center">
        <Button variant="ghost" size="sm" onClick={onClose} className="text-sm text-gray-600 hover:text-gray-800">
          Close
        </Button>
      </div>
    </div>
  );
};

export default NotificationsPanel;
