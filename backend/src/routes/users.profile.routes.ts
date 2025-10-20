// routes/user.routes.ts
import { Router } from "express";
import { authMiddleware, requireAdmin } from "../middleware/auth.middleware.js";
import {
  getCurrentStudent,
  updateCurrentStudent,
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  toggleTeacherStatus,
  toggleStudentStatus,
} from "../controllers/user.profile.controller.js";
import { listAnnouncementsForUser } from "../controllers/announcement.controller.js";

const router = Router();

/* -------------------------------------------------------------------------- */
/*         Authenticated Student Profile (for the current logged student)     */
/* -------------------------------------------------------------------------- */
router.get("/me", authMiddleware, getCurrentStudent);
router.put("/me", authMiddleware, updateCurrentStudent);
router.get("/me/announcements", authMiddleware, listAnnouncementsForUser);

/* -------------------------------------------------------------------------- */
/*                            Admin‑Only: Students CRUD                       */
/* -------------------------------------------------------------------------- */
router.get("/students", authMiddleware, requireAdmin, getAllStudents);
router.get("/students/:id", authMiddleware, requireAdmin, getStudentById);
router.post("/students", authMiddleware, requireAdmin, createStudent);
router.put("/students/:id", authMiddleware, requireAdmin, updateStudent);
router.delete("/students/:id", authMiddleware, requireAdmin, deleteStudent);
router.patch("/students/:id/status", authMiddleware, requireAdmin, toggleStudentStatus); // ✅ added

/* -------------------------------------------------------------------------- */
/*                            Admin‑Only: Teachers CRUD                       */
/* -------------------------------------------------------------------------- */
router.get("/teachers", authMiddleware, requireAdmin, getAllTeachers);
router.get("/teachers/:id", authMiddleware, requireAdmin, getTeacherById);
router.post("/teachers", authMiddleware, requireAdmin, createTeacher);
router.put("/teachers/:id", authMiddleware, requireAdmin, updateTeacher);
router.delete("/teachers/:id", authMiddleware, requireAdmin, deleteTeacher);
router.patch("/teachers/:id/status", authMiddleware, requireAdmin, toggleTeacherStatus);

export default router;
