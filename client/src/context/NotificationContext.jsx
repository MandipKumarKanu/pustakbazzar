import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getNotifications as apiGetNotifications,
  markNotificationAsRead as apiMarkNotificationAsRead,
  markAllNotificationsAsRead as apiMarkAllNotificationsAsRead,
} from '../api/notification';
import useAuthStore from '../stores/authStore';
import { useSocket } from './SocketContext'; // Assuming SocketContext is in the same directory or adjust path
import { toast } from 'sonner'; // For optional new notification toasts

const NotificationContext = createContext();

export const useNotification = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);

  const { user, token } = useAuthStore();
  const { socket } = useSocket();

  const fetchNotifications = useCallback(async (page = 1, limit = 10) => {
    if (!user || !token) return;
    setIsLoading(true);
    try {
      const data = await apiGetNotifications(page, limit);
      setNotifications(prev => page === 1 ? data.notifications : [...prev, ...data.notifications]);
      setUnreadCount(data.unreadCount);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
      setTotalNotifications(data.totalNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Optionally, set an error state here to display to the user
    } finally {
      setIsLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    if (user && token) {
      fetchNotifications(1); // Fetch initial page on user login
    } else {
      // Clear notifications if user logs out
      setNotifications([]);
      setUnreadCount(0);
      setTotalPages(1);
      setCurrentPage(1);
      setTotalNotifications(0);
    }
  }, [user, token, fetchNotifications]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewNotification = (newNotification) => {
      setNotifications(prev => [newNotification, ...prev].slice(0, 20)); // Keep list manageable, or implement better pagination update
      setUnreadCount(prev => prev + 1);
      setTotalNotifications(prev => prev + 1); // Increment total
      
      // Optional: Show a toast
      toast.info(newNotification.message, {
        // description: `Type: ${newNotification.type}`, // Or more context
        // action: { label: 'View', onClick: () => navigateToNotification(newNotification) } // Requires navigate function
      });
    };

    const handleNotificationRead = ({ notificationId, isRead }) => {
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead } : n)
      );
      // Unread count is updated via unreadNotificationCount event or full fetch
    };
    
    const handleAllNotificationsRead = ({ userId: eventUserId }) => {
        if (eventUserId === user.id) {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        }
    };

    const handleUnreadNotificationCount = ({ count }) => {
      setUnreadCount(count);
    };

    socket.on('newNotification', handleNewNotification);
    socket.on('notificationRead', handleNotificationRead); // When a single notification is marked read
    socket.on('allNotificationsRead', handleAllNotificationsRead); // When all are marked read
    socket.on('unreadNotificationCount', handleUnreadNotificationCount); // For explicit count updates

    return () => {
      socket.off('newNotification', handleNewMessage);
      socket.off('notificationRead', handleNotificationRead);
      socket.off('allNotificationsRead', handleAllNotificationsRead);
      socket.off('unreadNotificationCount', handleUnreadNotificationCount);
    };
  }, [socket, user]); // Removed navigateToNotification from deps as it's not defined here

  const markAsRead = async (notificationId) => {
    try {
      await apiMarkNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      // Fetch new unread count or wait for socket event 'unreadNotificationCount'
      // For immediate feedback, decrement locally if it was unread:
      const notif = notifications.find(n => n._id === notificationId);
      if (notif && !notif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read.');
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiMarkAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all as read.');
    }
  };
  
  // Function to load more notifications (for pagination)
  const loadMoreNotifications = () => {
    if (currentPage < totalPages && !isLoading) {
      fetchNotifications(currentPage + 1);
    }
  };

  const value = {
    notifications,
    unreadCount,
    isLoading,
    totalPages,
    currentPage,
    totalNotifications,
    fetchNotifications, // Expose to allow manual refresh if needed
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
