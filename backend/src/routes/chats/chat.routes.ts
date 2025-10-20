import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {getOrCreatePrivateChat, getChatWithUser }from "../../controllers/chats/chat.controller.js"

const router = express.Router();

// GET /api/chats/private/:userId?userType=teacher|student
router.get("/private/:userId", authMiddleware, getOrCreatePrivateChat);
router.get("/:userId", authMiddleware, getChatWithUser);

export default router;
