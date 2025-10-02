import { Router } from "express";
import {
  listChats,
  getMessages,
  createChat,
  getUserMessages,
} from "../controllers/chat.controller.js";

const router = Router();

router.get("/", listChats);
router.get("/:chatId/messages", getMessages);
router.post("/", createChat);
router.get("/user/:userId/messages", getUserMessages);

export default router;
