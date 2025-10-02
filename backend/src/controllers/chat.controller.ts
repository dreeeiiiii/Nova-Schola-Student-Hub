import { Request, Response } from "express";
import { Socket } from "socket.io";
import * as ChatService from "../services/chat.service.js";

// Socket event handler for sending message
export async function handleSendMessage(
  socket: Socket,
  io: any,
  data: { toUserId: string; text: string },
  userId: string,
  callback: Function
) {
  try {
    const { toUserId, text } = data;
    const chat = await ChatService.getOrCreatePrivateChat(userId, toUserId);
    const message = await ChatService.createMessage(chat.id, userId, text);

    io.to(chat.id).emit("receive_message", message);
    callback({ status: "ok", message });
  } catch (error: any) {
    callback({ status: "error", error: error.message });
  }
}

// REST controllers
export async function listChats(req: Request, res: Response) {
  const userId = req.query.userId as string;
  if (!userId) return res.status(400).json({ error: "Missing userId query parameter" });
  const chats = await ChatService.findChatsForUser(userId);
  res.json(chats);
}

export async function getMessages(req: Request, res: Response) {
  const chatId = req.params.chatId;
  if (!chatId) return res.status(400).json({ error: "Missing chatId parameter" });
  const messages = await ChatService.getMessages(chatId);
  res.json(messages);
}

export async function createChat(req: Request, res: Response) {
  const { members } = req.body;
  if (!Array.isArray(members) || members.length === 0)
    return res.status(400).json({ error: "Members must be a non-empty array" });
  const chat = await ChatService.getOrCreatePrivateChat(members[0], members[1]);
  res.status(201).json(chat);
}

export async function getUserMessages(req: Request, res: Response) {
  const userId = req.params.userId;
  if (!userId) return res.status(400).json({ error: "Missing userId parameter" });
  const messages = await ChatService.getMessagesForUser(userId);
  res.json(messages);
}
