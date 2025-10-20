import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

// ---------------- Core Routes ----------------
import authRoutes from "./routes/auth.routes.js";
import announcementRoutes from "./routes/announcement.routes.js";
import profileRoutes from "./routes/users.profile.routes.js";

// ---------------- Admin + User Management ----------------
import userCrudRoutes from "./routes/users.profile.routes.js"; // ✅ admin/student/teacher CRUD
import dashboardRoutes from "./routes/admin/dashboard.routes.js";
import violationRoutes from "./routes/admin/violations.routes.js";
import reportRoutes from "./routes/admin/reports.routes.js";

// ---------------- Chat System Routes ----------------
import chatRoutes from "./routes/chats/chat.routes.js";
import chatUserRoutes from "./routes/chats/users.routes.js";
import messageRoutes from "./routes/chats/message.routes.js";
import contactsRoutes from "./routes/students/contacts.routes.js";
import lastChatRoutes from "./routes/chats/lastActive.routes.js";

const app = express();

// ---------------- Middleware ----------------
app.use(helmet());

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ---------------- Routes ----------------
// 💬 Core System
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/announcements", announcementRoutes);

// 🧑‍💼 Admin + User Management
app.use("/api/admin/users", userCrudRoutes); // ✅ teachers & students CRUD now under /api/admin/users
app.use("/api/admin", dashboardRoutes);
app.use("/api/admin/violations", violationRoutes);
app.use("/api/admin/reports", reportRoutes);


// 💬 Chat System
app.use("/api/chats", chatRoutes);
app.use("/api/lastChats", lastChatRoutes);
app.use("/api/chat/users", chatUserRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/contacts", contactsRoutes);



// ---------------- Test Route ----------------
app.get("/", (req, res) =>
  res.json({ ok: true, message: "Student Hub API running successfully 🚀" })
);

// ---------------- Error Handling ----------------
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

export default app;
