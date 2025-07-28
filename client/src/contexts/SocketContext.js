import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:8080', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      newSocket.on('vehicle-entered', (data) => {
        console.log('Vehicle entered:', data);
        // Handle vehicle entry event
      });

      newSocket.on('vehicle-exited', (data) => {
        console.log('Vehicle exited:', data);
        // Handle vehicle exit event
      });

      newSocket.on('barrier-updated', (data) => {
        console.log('Barrier updated:', data);
        // Handle barrier update event
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const joinParkingLot = (parkingLotId) => {
    if (socket) {
      socket.emit('join-parking-lot', parkingLotId);
    }
  };

  const leaveParkingLot = (parkingLotId) => {
    if (socket) {
      socket.emit('leave-parking-lot', parkingLotId);
    }
  };

  const value = {
    socket,
    isConnected,
    joinParkingLot,
    leaveParkingLot
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 