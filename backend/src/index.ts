import http from "http";
import dotenv from "dotenv";
import app from "./app.js";
import { Server as IOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";

// Controllers & Services
import * as MessageController from "../src/controllers/chats/message.controller.js";
import {
  getUserById,
  getMessagesByChat,
  isChatMember,
  getOrCreatePrivateChat,
  findChatsForUser,
} from "../src/services/chat.service.js";

dotenv.config();

const server = http.createServer(app);
const JWT_SECRET = process.env.JWT_SECRET || "12345678";

function setupSocket(server: http.Server) {
  const io = new IOServer(server, {
    cors: {
      origin: [
        process.env.FRONTEND_URL || "http://localhost:5173",
        "http://localhost:5173"
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  /* ---------------- JWT Authentication ---------------- */
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("Authentication error: no token"));

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        role: "student" | "teacher" | "admin";
      };
      socket.data.userId = decoded.id;
      socket.data.role = decoded.role;
      next();
    } catch (err) {
      console.error("Token verification failed:", err);
      next(new Error("Authentication error"));
    }
  });

  /* ---------------- Connection Handler ---------------- */
  io.on("connection", async (socket: Socket) => {
    const userId = socket.data.userId as string;
    const userRole = socket.data.role as "student" | "teacher" | "admin";
    console.log(`✅ User connected: ${userId} (${userRole})`);

    // ✅ Join personal user room for direct events
    socket.join(`user:${userId}`);

    // ✅ Join all existing chat rooms
    if (userRole === "student" || userRole === "teacher") {
      try {
        const chats = await findChatsForUser(userRole, userId);
        for (const c of chats) if (c?.id) socket.join(c.id);
        console.log(`User ${userId} joined ${chats.length} chat rooms`);
      } catch (err) {
        console.error(`Failed to join rooms for user ${userId}:`, err);
      }
    }

    /* ---------------- Get Message History ---------------- */
    socket.on("getMessageHistory", async (payload, ack) => {
      try {
        let messages = [];

        if (payload?.chatId) {
          const allowed = await isChatMember(payload.chatId, userId);
          if (!allowed) return ack?.({ status: "error", error: "Not allowed in chat" });

          messages = await getMessagesByChat(payload.chatId);
        } else if (payload?.userId) {
          if (userRole !== "student" && userRole !== "teacher") {
            return ack?.({ status: "error", error: "Admins cannot chat directly" });
          }

          const peer = await getUserById(payload.userId);
          if (!peer) return ack?.({ status: "error", error: "User not found" });

          const peerRole: "student" | "teacher" =
            peer.role === "student" || peer.role === "teacher" ? peer.role : "student";

          const chatUserRole: "student" | "teacher" = userRole;
          const chat = await getOrCreatePrivateChat(chatUserRole, userId, peerRole, peer.id);
          messages = await getMessagesByChat(chat.id);

          socket.join(chat.id);
          return ack?.({ status: "ok", chatId: chat.id, messages });
        } else {
          return ack?.({ status: "error", error: "Invalid payload" });
        }

        socket.emit("messageHistory", messages);
        ack?.({ status: "ok", messages });
      } catch (err) {
        console.error("getMessageHistory error:", err);
        ack?.({ status: "error", error: "Server error" });
      }
    });

    /* ---------------- Send Message ---------------- */
    socket.on("sendMessage", (data, callback) => {
      try {
        MessageController.handleSendMessage(socket, io, data, userId, callback);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Error handling sendMessage:", message);
        callback?.({ status: "error", error: message });
      }
    });

    /* ---------------- Disconnect ---------------- */
    socket.on("disconnect", (reason) => {
      console.log(`❌ User disconnected: ${userId}, reason: ${reason}`);
    });
  });

  return io;
}

const io = setupSocket(server);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export { io };
