
import { Response } from "express";
import { AuthedRequest } from "../../middleware/auth.middleware.js";
import * as ChatService from "../../services/chat.service.js";
import { Socket, Server as IOServer, Server } from "socket.io";

/* ---------------- REST ---------------- */

interface SendMessageData {
  toUserId: string;
  content: string;
}

/**
 * GET /api/messages/:chatId?limit=50&offset=0
 */
export async function listMessagesByChat(
  req: AuthedRequest,
  res: Response
): Promise<Response> {
  try {
    const meRaw = req.user?.id;
    const me = typeof meRaw === "number" ? meRaw.toString() : meRaw;
    const chatId = req.params.chatId;

    const limit = Math.min(parseInt(String(req.query.limit || 50), 10), 100);
    const offset = Math.max(parseInt(String(req.query.offset || 0), 10), 0);
    const order = req.query.order === "asc" ? "asc" : "desc";

    if (!me) return res.status(401).json({ ok: false, error: "Unauthorized" });
    if (!chatId) return res.status(400).json({ ok: false, error: "Missing chatId" });
    if (isNaN(Number(chatId))) return res.status(400).json({ ok: false, error: "Invalid chatId" });

    const isMember = await ChatService.isChatMember(chatId, me);
    if (!isMember) return res.status(403).json({ ok: false, error: "Forbidden" });

    const raw = await ChatService.listMessagesByChat(chatId, { limit, offset, order });

    const messages = raw.map((m) => ({
      id: m.id,
      sender: {
        id: m.senderId,
        name: m.sender?.name || "Unknown",
        avatar: m.sender?.avatar || null,
      },
      text: m.text,
      timestamp: m.createdAt,
    }));

    return res.json({ ok: true, messages });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("listMessagesByChat error:", message);
    return res.status(500).json({ ok: false, error: message });
  }
}


/**
 * GET /api/messages/user/all
 */
export async function getMessagesForUser(
  req: AuthedRequest,
  res: Response
): Promise<Response> {
  try {
    const userIdRaw = req.user?.id;
    const userId = typeof userIdRaw === "number" ? userIdRaw.toString() : userIdRaw;
    const memberType = req.user?.role;

    if (!userId || (memberType !== "student" && memberType !== "teacher")) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }

    const raw = await ChatService.getMessagesForUser(memberType, userId);

    const messages = raw.map((m: ChatService.Message) => ({
      id: m.id,
      chatId: m.chatId,
      sender: m.senderId,
      text: m.text,
      timestamp: m.createdAt,
    }));
    

    return res.json({ ok: true, messages });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("getMessagesForUser error:", message);
    return res.status(500).json({ ok: false, error: message });
  }
}

/* ---------------- Socket.IO ---------------- */

/**
 * Socket sender: save the message, then emit to room
 */
/**
 * Socket sender: save the message, then emit to sender and receiver
 */
export async function handleSendMessage(
  socket: Socket,
  io: IOServer,
  data: SendMessageData,
  senderId: string,
  callback?: (resp: any) => void
) {
  const senderRole = socket.data.role as "student" | "teacher" | "admin";
  const { toUserId, content } = data;

  if (!toUserId || !content?.trim()) {
    if (callback) callback({ status: "error", error: "Invalid message data" });
    return;
  }

  try {
    // Get receiver info
    const peer = await ChatService.getUserById(toUserId);
    if (!peer) throw new Error("Receiver not found");

    const peerRole: "student" | "teacher" =
      peer.role === "student" || peer.role === "teacher" ? peer.role : "student";

    // Get or create chat
    const chat = await ChatService.getOrCreatePrivateChat(
      senderRole as "student" | "teacher",
      senderId,
      peerRole,
      toUserId
    );

    // Save message
    const message = await ChatService.saveMessage(chat.id, senderId, content);

    // Add helpful flag for frontend
    const messageData = {
      ...message,
      fromCurrentUser: true, // for sender
    };

    // Emit to sender
    socket.emit("message", messageData);

    // Emit to all sockets of receiver
    io.to(`user:${toUserId}`).emit("message", {
      ...message,
      fromCurrentUser: false, // for receiver
    });

    // Ensure callback is always called
    if (callback) callback({ status: "ok", message });
  } catch (err: any) {
    console.error("handleSendMessage error:", err);
    if (callback) callback({ status: "error", error: err.message });
  }
}

