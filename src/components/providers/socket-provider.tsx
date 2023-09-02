'use client';

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { io as ClientIO, Socket } from 'socket.io-client';

type SocketContextType = {
  socket: Socket | null;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: ReactNode }) {
  // const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = ClientIO(process.env.NEXT_PUBLIC_SITE_URL ?? '', {
      path: '/api/socket/io',
      addTrailingSlash: false,
    });
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onError = (err: unknown) => console.error('[SOCKET_ERR]', err);

    socketRef.current.on('connect', onConnect);
    socketRef.current.on('disconnect', onDisconnect);
    socketRef.current.on('error', onError);

    return () => {
      socketRef.current?.off('connect', onConnect);
      socketRef.current?.off('disconnect', onDisconnect);
      socketRef.current?.off('error', onError);
      socketRef.current?.disconnect();
    };
  }, []);
  // useEffect(() => {
  //   const socketInstance = ClientIO(process.env.NEXT_PUBLIC_SITE_URL ?? '', {
  //     path: '/api/socket/io',
  //     addTrailingSlash: false,
  //   });

  //   socketInstance.on('error', (err) => {
  //     console.error('[SOCKET_CONNECTION]', err);
  //   });

  //   socketInstance.on('connect', () => {
  //     setIsConnected(true);
  //     setSocket(socketInstance);
  //   });

  //   socketInstance.on('disconnect', () => {
  //     setIsConnected(false);
  //     setSocket(null);
  //   });

  //   return () => {
  //     setIsConnected(false);
  //     setSocket(null);
  //     socketInstance.disconnect();
  //   };
  // }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
