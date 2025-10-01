import { v4 as uuidv4 } from "uuid";
const chats = [];
const messages = [];
export const ChatService = {
    createChat(members) {
        const chat = { id: uuidv4(), members, lastUpdated: new Date().toISOString() };
        chats.push(chat);
        return chat;
    },
    findChatsForUser(userId) {
        return chats.filter((c) => c.members.includes(userId));
    },
    getMessages(chatId) {
        return messages.filter((m) => m.chatId === chatId).sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));
    },
    createMessage(chatId, senderId, text) {
        const msg = { id: uuidv4(), chatId, senderId, text, createdAt: new Date().toISOString() };
        messages.push(msg);
        const chat = chats.find((c) => c.id === chatId);
        if (chat)
            chat.lastUpdated = new Date().toISOString();
        return msg;
    },
};
