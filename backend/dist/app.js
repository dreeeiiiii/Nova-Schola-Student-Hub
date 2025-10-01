import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import announcementRoutes from "./routes/announcement.routes.js";
import chatRoutes from "./routes/chat.routes.js";
const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api/auth", authRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/chats", chatRoutes);
app.get("/", (req, res) => res.json({ ok: true, message: "Student Hub API" }));
// Basic error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});
export default app;
