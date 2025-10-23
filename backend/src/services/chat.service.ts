import { query } from "../db.js";
import { v4 as uuidv4 } from "uuid";

/* ---------------- Types ---------------- */
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
    avatar: string | null;
    role: "student" | "teacher";
  };
  text: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  members: string[];
  lastUpdated: string;
}

/* ---------------- Helpers ---------------- */
function memberKey(type: "student" | "teacher", id: string): string {
  return `${type}:${id}`;
}

/**
 * Find an existing private chat whose 2 members are exactly the provided pair
 */
async function findExactPrivateChat(
  userAType: "student" | "teacher",
  userAId: string,
  userBType: "student" | "teacher",
  userBId: string
): Promise<Chat | null> {
  const sql = `
    SELECT c.id, c.last_updated, ARRAY_AGG(cm.member_id) AS members
    FROM chats c
    JOIN chat_members cm ON cm.chat_id = c.id
    WHERE c.id IN (
      SELECT chat_id FROM chat_members WHERE (member_type = $1 AND member_id = $2)
      INTERSECT
      SELECT chat_id FROM chat_members WHERE (member_type = $3 AND member_id = $4)
    )
    GROUP BY c.id
    ORDER BY c.last_updated DESC
    LIMIT 1
  `;

  const res = await query(sql, [userAType, userAId, userBType, userBId]);
  if (res.rowCount && res.rows[0]) {
    const row = res.rows[0];
    return {
      id: row.id,
      lastUpdated: new Date(row.last_updated).toISOString(),
      members: row.members,
    };
  }
  return null;
}

/* ---------------- Chats ---------------- */
export async function getOrCreatePrivateChat(
  userAType: "student" | "teacher",
  userAId: string,
  userBType: "student" | "teacher",
  userBId: string
): Promise<Chat> {
  const existing = await findExactPrivateChat(userAType, userAId, userBType, userBId);
  if (existing) return existing;

  const chatId = uuidv4();
  const now = new Date();

  await query(`INSERT INTO chats (id, last_updated) VALUES ($1, $2)`, [chatId, now]);

  await query(
    `INSERT INTO chat_members (chat_id, member_type, member_id)
     VALUES ($1, $2, $3), ($1, $4, $5)
     ON CONFLICT (chat_id, member_type, member_id) DO NOTHING`,
    [chatId, userAType, userAId, userBType, userBId]
  );

  return { id: chatId, lastUpdated: now.toISOString(), members: [userAId, userBId] };
}

export async function isChatMember(chatId: string, userId: string): Promise<boolean> {
  const res = await query(
    `SELECT 1 FROM chat_members WHERE chat_id = $1 AND member_id = $2 LIMIT 1`,
    [chatId, userId]
  );
  return (res.rowCount ?? 0) > 0;
}

/* ---------------- Messages ---------------- */
export async function saveMessage(chatId: string, senderId: string, text: string): Promise<Message> {
  const id = uuidv4();
  const now = new Date();

  await query(
    `INSERT INTO messages (id, chat_id, sender_id, text, created_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, chatId, senderId, text, now]
  );

  await query(`UPDATE chats SET last_updated = $1 WHERE id = $2`, [now, chatId]);

  return {
    id,
    chatId,
    senderId,
    sender: {
      id: senderId,
      name: "",
      avatar: null,
      role: "student", // default, will be replaced when fetching
    },
    text,
    createdAt: now.toISOString(),
  };
}

/**
 * ✅ Fetch all messages in a chat with proper sender info
 */
export async function listMessagesByChat(
  chatId: string,
  opts: { limit?: number; offset?: number; order?: "asc" | "desc" } = {}
): Promise<Message[]> {

  const limit = opts.limit ?? 50;
  const offset = opts.offset ?? 0;
  const order = opts.order === "desc" ? "DESC" : "ASC";

  const res = await query(
    `
    SELECT m.id, m.chat_id, m.sender_id, m.text, m.created_at,
           COALESCE(s.name, t.name) AS sender_name,
           COALESCE(s.avatar, LEFT(COALESCE(s.name, t.name),1)) AS sender_avatar,
           CASE 
             WHEN s.id IS NOT NULL THEN 'student'
             WHEN t.id IS NOT NULL THEN 'teacher'
           END AS sender_role
    FROM messages m
    LEFT JOIN students s ON m.sender_id = s.id
    LEFT JOIN teachers t ON m.sender_id = t.id
    WHERE m.chat_id = $1
    ORDER BY m.created_at ${order}
    LIMIT $2 OFFSET $3
    `,
    [chatId, limit, offset]
  );

  return res.rows.map((r: any) => ({
    id: r.id,
    chatId: r.chat_id,
    senderId: r.sender_id,
    sender: {
      id: r.sender_id,
      name: r.sender_name,
      avatar: r.sender_avatar,
      role: r.sender_role,
    },
    text: r.text,
    createdAt: new Date(r.created_at).toISOString(),
  }));
}


export async function getMessagesByChat(chatId: string): Promise<Message[]> {
  return listMessagesByChat(chatId, { limit: 100, offset: 0 });
}

/* ---------------- Users ---------------- */
export async function searchUsers(queryStr: string) {
  const res = await query(
    `
    SELECT id, name, email, avatar, 'student' AS role FROM students
    WHERE LOWER(name) LIKE LOWER($1) OR LOWER(email) LIKE LOWER($1)
    UNION
    SELECT id, name, email, avatar, 'teacher' AS role FROM teachers
    WHERE LOWER(name) LIKE LOWER($1) OR LOWER(email) LIKE LOWER($1)
    `,
    [`%${queryStr}%`]
  );
  return res.rows;
}
export async function getUserById(userId: string) {
  const res = await query(
    `
    SELECT id, name, email, COALESCE(avatar, LEFT(name,1)) AS avatar, 'student' AS role FROM students WHERE id = $1
    UNION
    SELECT id, name, email, COALESCE(avatar, LEFT(name,1)) AS avatar, 'teacher' AS role FROM teachers WHERE id = $1
    `,
    [userId]
  );

  return res.rows?.[0] || null;
}


/* ---------------- Chat Lists ---------------- */
export async function findChatsForUser(
  memberType: "student" | "teacher",
  memberId: string
): Promise<Chat[]> {
  const res = await query(
    `
    SELECT c.id, c.last_updated, ARRAY_AGG(cm.member_id) AS members
    FROM chats c
    JOIN chat_members cm ON cm.chat_id = c.id
    WHERE cm.member_type = $1 AND cm.member_id = $2
    GROUP BY c.id
    `,
    [memberType, memberId]
  );

  return res.rows.map((row: any) => ({
    id: row.id,
    lastUpdated: new Date(row.last_updated).toISOString(),
    members: row.members,
  }));
}

/**
 * Get all messages for a user across all chats (newest first)
 */
export async function getMessagesForUser(
  memberType: "student" | "teacher",
  memberId: string
): Promise<Message[]> {
  const chatsRes = await query(
    `
    SELECT DISTINCT c.id
    FROM chats c
    JOIN chat_members cm ON cm.chat_id = c.id
    WHERE cm.member_type = $1 AND cm.member_id = $2
    `,
    [memberType, memberId]
  );

  const chatIds: string[] = (chatsRes.rows || []).map((r: any) => r.id);
  if (chatIds.length === 0) return [];

  const res = await query(
    `
    SELECT id, chat_id, sender_id, text, created_at
    FROM messages
    WHERE chat_id = ANY($1)
    ORDER BY created_at DESC
    `,
    [chatIds]
  );

  return (res.rows || []).map((r: any) => ({
    id: r.id,
    chatId: r.chat_id,
    senderId: r.sender_id,
    sender: {
      id: r.sender_id,
      name: "",
      avatar: null,
      role: "student",
    },
    text: r.text,
    createdAt: new Date(r.created_at).toISOString(),
  }));
}
