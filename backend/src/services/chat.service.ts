import { Chat, Message } from "../models/chat.models.js";
import { v4 as uuidv4 } from "uuid";


const chats: Chat[] = [];
const messages: Message[] = [];


export const ChatService = {
createChat(members: string[]) {
const chat: Chat = { id: uuidv4(), members, lastUpdated: new Date().toISOString() };
chats.push(chat);
return chat;
},

findChatsForUser(userId: string) {
return chats.filter((c) => c.members.includes(userId));
},

getMessages(chatId: string) {
return messages.filter((m) => m.chatId === chatId).sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
},

createMessage(chatId: string, senderId: string, text: string) {
const msg: Message = { id: uuidv4(), chatId, senderId, text, createdAt: new Date().toISOString() };
messages.push(msg);
const chat = chats.find((c) => c.id === chatId);
if (chat) chat.lastUpdated = new Date().toISOString();
return msg;
},
};