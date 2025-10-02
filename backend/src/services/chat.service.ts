import { query } from "../db.js";
import { v4 as uuidv4 } from "uuid";

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  members: string[];
  lastUpdated: string;
}

export async function getOrCreatePrivateChat(userA: string, userB: string): Promise<Chat> {
  const res = await query(
    `SELECT c.id, c.last_updated, ARRAY_AGG(cm.user_id) AS members
     FROM chats c
     JOIN chat_members cm ON cm.chat_id = c.id
     GROUP BY c.id
     HAVING ARRAY_AGG(cm.user_id) @> $1 AND ARRAY_AGG(cm.user_id) <@ $1`,
    [[userA, userB]]
  );

  if (res.rowCount??0  > 0) {
    const row = res.rows[0];
    return {
      id: row.id,
      lastUpdated: row.last_updated,
      members: row.members,
    };
  }

  const chatId = uuidv4();
  const now = new Date();
  await query("INSERT INTO chats (id, last_updated) VALUES ($1, $2)", [chatId, now]);

  for (const userId of [userA, userB]) {
    await query("INSERT INTO chat_members (chat_id, user_id) VALUES ($1, $2)", [chatId, userId]);
  }

  return { id: chatId, members: [userA, userB], lastUpdated: now.toISOString() };
}

export async function createMessage(chatId: string, senderId: string, text: string): Promise<Message> {
  const messageId = uuidv4();
  const now = new Date();
  await query(
    "INSERT INTO messages (id, chat_id, sender_id, text, created_at) VALUES ($1, $2, $3, $4, $5)",
    [messageId, chatId, senderId, text, now]
  );
  await query("UPDATE chats SET last_updated = $1 WHERE id = $2", [now, chatId]);
  return { id: messageId, chatId, senderId, text, createdAt: now.toISOString() };
}

export async function getMessages(chatId: string): Promise<Message[]> {
  const res = await query("SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC", [chatId]);
  return res.rows;
}

export async function findChatsForUser(userId: string): Promise<Chat[]> {
  const res = await query(
    `SELECT c.id, c.last_updated, ARRAY_AGG(cm.user_id) AS members
     FROM chats c
     JOIN chat_members cm ON cm.chat_id = c.id
     WHERE cm.user_id = $1
     GROUP BY c.id`,
    [userId]
  );
  return res.rows.map(row => ({
    id: row.id,
    lastUpdated: row.last_updated,
    members: row.members,
  }));
}

export async function getMessagesForUser(userId: string): Promise<Message[]> {
  const chats = await findChatsForUser(userId);
  const chatIds = chats.map(c => c.id);
  if (chatIds.length === 0) return [];

  const res = await query(`SELECT * FROM messages WHERE chat_id = ANY($1) ORDER BY created_at DESC`, [chatIds]);
  return res.rows;
}
