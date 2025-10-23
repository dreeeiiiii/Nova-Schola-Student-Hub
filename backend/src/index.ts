import http from "http";
import dotenv from "dotenv";
import app from "./app.js";
import { Server as IOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";

// Controllers & Services
// FIXED
import {
  getUserById,
  getMessagesByChat,
  isChatMember,
  getOrCreatePrivateChat,
  findChatsForUser,
  saveMessage,
  Message
} from "./services/chat.service.js";


dotenv.config();

const server = http.createServer(app);
const JWT_SECRET = process.env.JWT_SECRET || "12345678";

function setupSocket(server: http.Server) {
  const io = new IOServer(server, {
    cors: {
      origin: [
        process.env.FRONTEND_URL || "http://localhost:5173",
        "http://localhost:5173",
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

    // Join personal room
    socket.join(`user:${userId}`);

    // Join existing chat rooms
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
        if (!ack) return;
    
        let chatId: string | undefined = payload?.chatId;
        let messages: Message[] = [];
    
        // If userId is provided, find or create private chat
        if (payload?.userId) {
          const peer = await getUserById(payload.userId);
          if (!peer) return ack({ status: "error", error: "User not found" });
    
          // Only students or teachers can start chats
          if (!["student", "teacher"].includes(userRole)) {
            return ack({ status: "error", error: "Admins cannot start chats" });
          }
    
          // Narrow types for TS
          const currentRole = userRole as "student" | "teacher";
          const peerRole = peer.role as "student" | "teacher";
    
          const chat = await getOrCreatePrivateChat(currentRole, userId, peerRole, peer.id);
          chatId = chat.id;
          socket.join(chatId);
        }
    
        if (chatId) {
          const allowed = await isChatMember(chatId, userId);
          if (!allowed) return ack({ status: "error", error: "Not allowed in chat" });
    
          messages = await getMessagesByChat(chatId);
        }
    
        // Always respond, even if empty
        ack({ status: "ok", chatId: chatId || null, messages });
      } catch (err) {
        console.error("getMessageHistory error:", err);
        ack({ status: "error", error: "Server error" });
      }
    });
    
    

    /* ---------------- Send Message ---------------- */
    socket.on("sendMessage", async (data, callback) => {
      try {
        const chatId = data.chatId;
        const content = data.content?.trim();
        if (!chatId || !content) return callback?.({ status: "error", error: "Invalid data" });

        const allowed = await isChatMember(chatId, userId);
        if (!allowed) return callback?.({ status: "error", error: "Not allowed in chat" });

        // Save message
        const msg = await saveMessage(chatId, userId, content);

        // Broadcast to all in chat
        io.to(chatId).emit("message", {
          id: msg.id,
          sender_id: msg.senderId,
          text: msg.text,
          created_at: msg.createdAt,
        });

        callback?.({ status: "ok", message: msg });
      } catch (err: any) {
        console.error("sendMessage error:", err);
        callback?.({ status: "error", error: err.message || "Server error" });
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
