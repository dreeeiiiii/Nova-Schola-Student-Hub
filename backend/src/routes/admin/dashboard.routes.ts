// src/routes/dashboardRoutes.ts
import { Router } from "express";
import {
  getDashboardOverview,
  getStudents,
  addStudent,
  getTeachers,
  addTeacher,
  getAnnouncements,
  addAnnouncement,
  getViolations,
  addViolation,
} from "../../controllers/admin/dashboard.controller.js";
import { authMiddleware, requireAdmin } from "../../middleware/auth.middleware.js";

const router = Router();

// 🧭 Protected Dashboard Overview (Admin Only)
router.get("/dashboard/overview", authMiddleware, requireAdmin, getDashboardOverview);

// 👩‍🎓 STUDENTS
router.get("/students", authMiddleware, requireAdmin, getStudents);
router.post("/students", authMiddleware, requireAdmin, addStudent);

// 👨‍🏫 TEACHERS
router.get("/teachers", authMiddleware, requireAdmin, getTeachers);
router.post("/teachers", authMiddleware, requireAdmin, addTeacher);

// 📢 ANNOUNCEMENTS
router.get("/announcements", authMiddleware, requireAdmin, getAnnouncements);
router.post("/announcements", authMiddleware, requireAdmin, addAnnouncement);

// 🚨 VIOLATIONS
router.get("/violations", authMiddleware, requireAdmin, getViolations);
router.post("/violations", authMiddleware, requireAdmin, addViolation);

export default router;
