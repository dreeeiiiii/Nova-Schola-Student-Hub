// index.ts (server entrypoint)
import http from "http";
import dotenv from "dotenv";
import app from "./app.js";
import { setupSocket } from "./utils/socket.js";

dotenv.config();

const server = http.createServer(app);
setupSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
