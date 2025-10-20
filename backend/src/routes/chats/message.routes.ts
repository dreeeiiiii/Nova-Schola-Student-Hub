// src/routes/chats/messages.routes.ts
import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import * as MessageController from "../../controllers/chats/message.controller.js";

const router = express.Router();

// Get all messages for the authenticated user across all chats
router.get("/user/all", authMiddleware, MessageController.getMessagesForUser);

// Get messages for a specific chat (with pagination support)
router.get("/:chatId", authMiddleware, MessageController.listMessagesByChat);

export default router;
