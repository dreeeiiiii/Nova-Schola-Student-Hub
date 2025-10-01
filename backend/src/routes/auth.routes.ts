import { Router } from "express";
import { register, login, profile } from "../controllers/auth.controller.js";
import {authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected route
router.get("/profile", authMiddleware, profile);

export default router;
