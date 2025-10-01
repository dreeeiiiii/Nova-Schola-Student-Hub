import dotenv from "dotenv";
dotenv.config();
import http from "http";
import { Server as IOServer } from "socket.io";
import app from "./app.js";
import { ChatService } from "./services/chat.service.js";
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new IOServer(server, {
    cors: {
        origin: "*",
    },
});
// Basic socket.io chat handling
io.on("connection", (socket) => {
    console.log("socket connected:", socket.id);
    socket.on("join", (room) => {
        socket.join(room);
    });
    socket.on("leave", (room) => {
        socket.leave(room);
    });
    socket.on("send_message", (payload) => {
        // payload should contain: { chatId, senderId, text }
        const message = ChatService.createMessage(payload.chatId, payload.senderId, payload.text);
        io.to(payload.chatId).emit("receive_message", message);
    });
    socket.on("disconnect", () => {
        console.log("socket disconnected:", socket.id);
    });
});
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
