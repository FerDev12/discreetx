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
    if (socketRef.current) return;

    fetch('/api/socket/io');

    socketRef.current = ClientIO(process.env.NEXT_PUBLIC_SITE_URL ?? '', {
      // @ts-ignore
      origins: '*',
      path: '/api/socket/io',
      addTrailingSlash: false,
    });

    const onDisconnect = (reason: any) => {
      console.log('DISCONNECTED');
      console.log(reason);
      setIsConnected(false);
    };

    const onError = (err: unknown) => console.error('[SOCKET_ERROR]', err);
    const onConnect = () => {
      console.log('CONNECTED');
      socketRef.current?.on('error', onError);
      socketRef.current?.on('disconnect', onDisconnect);
      setIsConnected(true);
    };

    socketRef.current.on('connect', onConnect);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        setIsConnected(false);
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
