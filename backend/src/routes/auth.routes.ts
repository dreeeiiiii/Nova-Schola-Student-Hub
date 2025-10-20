import { Router } from "express";
import {
  StudentRegister,
  StudentLogin,
  profile,
  AdminLogin,
  AdminRegister,
  TeacherRegister,
  TeacherLogin,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// 👨‍🎓 Student Routes
router.post("/student/register", StudentRegister);
router.post("/student/login", StudentLogin);

// 🧑‍🏫 Teacher Routes
router.post("/teacher/register", TeacherRegister);
router.post("/teacher/login", TeacherLogin);

// 👨‍💼 Admin Routes
router.post("/admin/register", AdminRegister);
router.post("/admin/login", AdminLogin);

// 🔒 Authenticated User Route
router.get("/profile/:id", authMiddleware, profile);

export default router;
