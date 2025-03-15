import React, { useState, useEffect } from "react";
import { Bell, X, Check, AlertCircle, ChevronRight } from "lucide-react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "../../../config/firebase.config";
import ClickOutside from "../../../hooks/ClickOutside";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [popupNotification, setPopupNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const notificationsRef = collection(db, "notification");
      const q = query(
        notificationsRef,
        where("sellerId", "==", user.uid),
        orderBy("timestamp", "desc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newNotifications = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNotifications(newNotifications);
        setUnreadCount(newNotifications.filter((n) => !n.read).length);

        if (newNotifications.length > 0 && !newNotifications[0].read) {
          setPopupNotification(newNotifications[0]);
          setTimeout(() => {
            setPopupNotification(null);
          }, 5000);
        }
      });

      return () => unsubscribe();
    }
  }, []);

  const togglePanel = () => setIsOpen(!isOpen);

  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, "notification", notificationId);
      await updateDoc(notificationRef, { read: true });
    } catch (error) {
      console.error("Error marking notification as read: ", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const batch = notifications
        .filter((n) => !n.read)
        .map((n) => doc(db, "notification", n.id));
      batch.forEach(async (notificationRef) => {
        await updateDoc(notificationRef, { read: true });
      });
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read: ", error);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)}h ago`;
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }
    return "Unknown date";
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.status === "declined") {
      navigate("/admin/mydeclined", {
        state: { bookId: notification.id },
      });
    } else if (notification.status === "approved") {
      navigate("/admin/myapproved", {
        state: { bookId: notification.id },
      });
    } else {
      navigate("/admin/orderconfirmation", {
        state: { orderId: notification.bookId },
      });
    }

    setIsOpen(false);
  };

  const getNotificationIcon = (status) => {
    switch (status) {
      case "declined":
        return <AlertCircle className="text-red-500" />;
      case "approved":
        return <Check className="text-green-500" />;
      default:
        return <Bell className="text-blue-500" />;
    }
  };

  return (
    <>
      <ClickOutside onClick={() => setIsOpen(false)} className="relative">
        <motion.button
          onClick={togglePanel}
          className="text-white relative focus:outline-none transition-all duration-300 hover:text-blue-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="w-6 h-6 mt-2" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute top-0 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full"
              >
                {unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-0 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-full sm:w-96 bg-white rounded-lg shadow-2xl overflow-hidden z-20 max-h-[calc(100vh-5rem)] flex flex-col"
            >
              <div className="sticky top-0 z-10 flex justify-between items-center bg-gray-100 p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <button
                    className="text-blue-600 font-semibold hover:text-blue-800 transition duration-200"
                    onClick={markAllAsRead}
                  >
                    Mark All as Read
                  </button>
                )}
              </div>
              <div className="flex-grow overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-gray-500 text-center">
                    <Bell className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>No new notifications</p>
                  </div>
                ) : (
                  <>
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className={`flex items-start p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                          !notification.read ? "bg-blue-50" : "bg-white"
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex-shrink-0 mr-3">
                          {getNotificationIcon(notification.status)}
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm text-gray-800 font-medium">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                          {notification.status && (
                            <p
                              className={`text-xs mt-1 font-semibold ${
                                notification.status === "declined"
                                  ? "text-red-500"
                                  : "text-green-500"
                              }`}
                            >
                              Status: {notification.status}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="flex-shrink-0 text-gray-400 w-5 h-5" />
                      </motion.div>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ClickOutside>

      <AnimatePresence>
        {popupNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-80 p-4 bg-white text-gray-800 rounded-lg shadow-lg z-50 border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="w-5 h-5 text-blue-500 mr-2" />
                <p className="font-semibold">New Notification</p>
              </div>
              <button
                onClick={() => setPopupNotification(null)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-2 text-sm">{popupNotification.message}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NotificationPanel;
