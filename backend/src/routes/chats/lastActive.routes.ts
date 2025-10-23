import { Router, Response } from "express";
import pool from "../../db.js";
import { AuthedRequest, authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/last-messages", authMiddleware, async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const userId = req.user.id;

    const query = `
      SELECT
        CASE 
          WHEN s.id IS NOT NULL THEN s.id
          ELSE t.id
        END AS "userId",
        CASE 
          WHEN s.id IS NOT NULL THEN s.name
          ELSE t.name
        END AS "userName",
        m.text AS "lastMessage",
        m.created_at AS "lastUpdated"
      FROM chat_members cm
      JOIN chats c ON cm.chat_id = c.id
      JOIN chat_members other_cm 
        ON other_cm.chat_id = c.id AND other_cm.member_id != $1
      LEFT JOIN students s ON s.id = other_cm.member_id
      LEFT JOIN teachers t ON t.id = other_cm.member_id
      LEFT JOIN LATERAL (
        SELECT text, created_at
        FROM messages
        WHERE chat_id = c.id
        ORDER BY created_at DESC
        LIMIT 1
      ) m ON true
      WHERE cm.member_id = $1
      GROUP BY s.id, s.name, t.id, t.name, m.text, m.created_at
      ORDER BY m.created_at DESC NULLS LAST
    `;

    const { rows } = await pool.query(query, [userId]);

    res.json(
      rows.map((r) => ({
        userId: r.userId,
        userName: r.userName,
        lastMessage: r.lastMessage,
        lastUpdated: r.lastUpdated,
      }))
    );
  } catch (err) {
    console.error("Last messages error:", err);
    res.status(500).json({ error: "Failed to fetch last messages" });
  }
});

// Add this below your existing /last-messages route

router.get("/unread-count", authMiddleware, async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const userId = req.user.id;

    // Count messages in chats where the user is a member, but not sent by them
    // Assumes messages table has sender_id, chat_id
    const query = `
      SELECT COUNT(*) AS count
      FROM messages m
      JOIN chat_members cm ON m.chat_id = cm.chat_id
      WHERE cm.member_id = $1
        AND m.sender_id != $1
    `;

    const { rows } = await pool.query(query, [userId]);

    res.json({ count: parseInt(rows[0].count, 10) });
  } catch (err) {
    console.error("Unread count error:", err);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
});


export default router;
