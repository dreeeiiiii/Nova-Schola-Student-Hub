import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import * as ChatController from "../../controllers/chats/users.controller.js";

const router = express.Router();

// Search users to start a chat
router.get("/search", authMiddleware, ChatController.searchUsers);

// Get user profile by ID
router.get("/:id", authMiddleware, ChatController.getUserProfile);

export default router;
