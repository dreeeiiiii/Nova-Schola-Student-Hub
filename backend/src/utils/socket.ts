import { Server as IOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import * as ChatController from "../controllers/chat.controller.js";
import * as ChatService from "../services/chat.service.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export function setupSocket(server: any) {
  const io = new IOServer(server, { cors: { origin: "*" } });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { id: string };
      (socket as any).userId = payload.id;
      next();
    } catch {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", async (socket: Socket) => {
    const userId = (socket as any).userId;

    // Join user to their chat rooms
    const chats = await ChatService.findChatsForUser(userId);
    chats.forEach((chat) => socket.join(chat.id));

    socket.on("send_message", (data, callback) =>
      ChatController.handleSendMessage(socket, io, data, userId, callback)
    );

    socket.on("disconnect", () => console.log(`User disconnected: ${userId}`));
  });

  return io;
}
