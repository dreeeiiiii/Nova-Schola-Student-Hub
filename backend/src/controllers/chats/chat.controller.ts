import { Request, Response } from "express";
import * as ChatService from "../../services/chat.service.js";
import { AuthedRequest } from "../../middleware/auth.middleware.js";
import { client } from "../../db.js";

type AllowedRole = "student" | "teacher";

function normalizeRole(role: unknown): AllowedRole | null {
  if (role === "student" || role === "teacher") return role;
  if (role === "admin") return "teacher"; // allow admins as teachers
  return null;
}

/* -------------------------------------------------------------------------- */
/*   GET /api/chats/private/:userId?userType=student|teacher  (create/get)    */
/* -------------------------------------------------------------------------- */
export async function getOrCreatePrivateChat(req: AuthedRequest, res: Response) {
  try {
    const meId = String(req.user?.id);
    const meRole = normalizeRole(req.user?.role);
    const otherUserId = String(req.params.userId);

    if (!meId || !meRole)
      return res.status(401).json({ ok: false, error: "Unauthorized" });

    if (!otherUserId)
      return res
        .status(400)
        .json({ ok: false, error: "Missing userId parameter" });

    if (meId === otherUserId)
      return res
        .status(400)
        .json({ ok: false, error: "Cannot chat with yourself" });

    // Determine the other user's role
    let otherRole: AllowedRole | null =
      typeof req.query.userType === "string"
        ? (req.query.userType as AllowedRole)
        : null;

    if (!otherRole) {
      const otherUser = await ChatService.getUserById(otherUserId);
      if (!otherUser)
        return res.status(404).json({ ok: false, error: "User not found" });

      otherRole = normalizeRole(otherUser.role);
      if (!otherRole)
        return res
          .status(400)
          .json({ ok: false, error: "Unsupported other user role" });
    }

    // ✅ Get or create chat
    const chat = await ChatService.getOrCreatePrivateChat(
      meRole,
      meId,
      otherRole,
      otherUserId
    );

    // ✅ Fetch all messages for this chat
    const messages = await ChatService.getMessagesByChat(chat.id);

    return res.json({ ok: true, chat, messages });
  } catch (err: any) {
    console.error("getOrCreatePrivateChat error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}

/* -------------------------------------------------------------------------- */
/*              GET /api/chats/users/:userId  (fetch chat + messages)         */
/* -------------------------------------------------------------------------- */
export const getChatWithUser = async (req: AuthedRequest, res: Response) => {
  try {
    const currentUserId = String(req.user?.id);
    const otherUserId = String(req.params.userId);

    if (!currentUserId || !otherUserId) {
      return res.status(400).json({ ok: false, error: "Missing user IDs" });
    }

    // ✅ Fixed: Ensure both parameters are passed properly
    const chatQuery = `
      SELECT c.id AS chat_id, c.last_updated, ARRAY_AGG(cm.member_id) AS members
      FROM chats c
      JOIN chat_members cm ON cm.chat_id = c.id
      WHERE c.id IN (
          SELECT chat_id FROM chat_members WHERE member_id = $1
          INTERSECT
          SELECT chat_id FROM chat_members WHERE member_id = $2
      )
      GROUP BY c.id
      ORDER BY c.last_updated DESC
      LIMIT 1;
    `;

    // ✅ Always pass both parameters in an array (fixes your error)
    const chatResult = await client.query(chatQuery, [
      currentUserId,
      otherUserId,
    ]);

    if (chatResult.rows.length === 0) {
      return res.json({ ok: true, chat: null, messages: [] });
    }

    const chatId = chatResult.rows[0].chat_id;

    // ✅ Fetch all messages in this chat
    const messagesQuery = `
      SELECT id, chat_id, sender_id, text, created_at
      FROM messages
      WHERE chat_id = $1
      ORDER BY created_at ASC;
    `;
    const messagesResult = await client.query(messagesQuery, [chatId]);

    return res.json({
      ok: true,
      chat: chatResult.rows[0],
      messages: messagesResult.rows,
    });
  } catch (error: any) {
    console.error("getChatWithUser error:", error);
    res.status(500).json({ ok: false, error: "Server error" });
  }
};
