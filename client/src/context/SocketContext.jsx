import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';
import useAuthStore from '../stores/authStore';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]); // Placeholder for future use
  const { user, token } = useAuthStore();

  const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  useEffect(() => {
    if (user && token) {
      const newSocket = io(VITE_API_BASE_URL, {
        // Do not include query here if using 'join' event for user association
        // query: { userId: user.id || user._id }, 
        withCredentials: true, // Important for session/cookie based auth if used by socket
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        // Emit 'join' event to associate userId with this socket connection on the server
        newSocket.emit('join', user.id || user._id);
      });

      // Example listener for online users (if backend implements it)
      // newSocket.on('onlineUsers', (users) => {
      //   setOnlineUsers(users);
      // });

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });
      
      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      setSocket(newSocket);

      return () => {
        console.log('Cleaning up socket connection...');
        newSocket.disconnect();
        setSocket(null);
      };
    } else {
      // If user logs out or token is lost, disconnect existing socket
      if (socket) {
        console.log('User logged out, disconnecting socket...');
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [user, token, VITE_API_BASE_URL]);


  // Memoize context value to prevent unnecessary re-renders of consumers
  const contextValue = React.useMemo(() => ({
    socket,
    onlineUsers, // onlineUsers might not be fully implemented yet
  }), [socket, onlineUsers]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};
