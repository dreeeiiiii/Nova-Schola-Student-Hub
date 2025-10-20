import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_API_URL || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: false, // connect manually to prevent race conditions
  transports: ["websocket"],
  withCredentials: true,
});

export const connectSocket = () => {
  const token = localStorage.getItem("studentToken");
  if (token) {
    socket.auth = { token };
    socket.connect();
  }
};
