import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "@/services/config";

let socket: Socket | null = null;

export const getSocket = (token?: string): Socket => {
  if (!socket && typeof window !== "undefined") {
    socket = io(API_BASE_URL, {
      auth: { token },
      withCredentials: true,
      autoConnect: true,
      transports: ['websocket', 'polling']
    });
    
    socket.on('connect', () => console.log('Socket connected:', socket?.id));
    socket.on('connect_error', (err) => console.error('Socket connect error:', err));
  }
  return socket!;
};

export const connectSocket = (token?: string) => {
  const s = getSocket(token);
  if (!s.connected) {
    if (token) s.auth = { token };
    s.connect();
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
