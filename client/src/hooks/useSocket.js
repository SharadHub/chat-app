import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

export const useSocketEvents = (handlers) => {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [socket, handlers]);
};
