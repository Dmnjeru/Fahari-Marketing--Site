"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 👇 Connect to backend API (use .env var if available)
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const s = io(backendUrl, {
      transports: ["websocket"],
      withCredentials: true,
    });

    setSocket(s);

    s.on("connect", () => setIsConnected(true));
    s.on("disconnect", () => setIsConnected(false));

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
