import { Router } from "express";
import {
  listViolations,
  createViolation,
  updateViolationStatus,
  deleteViolation,
} from "../../controllers/admin/violations.controller.js";
import { authMiddleware, requireAdmin } from "../../middleware/auth.middleware.js";

const router = Router();

// Admin-only CRUD routes
router.get("/", authMiddleware, requireAdmin, listViolations);
router.post("/", authMiddleware, requireAdmin, createViolation);
router.put("/:id/status", authMiddleware, requireAdmin, updateViolationStatus);
router.delete("/:id", authMiddleware, requireAdmin, deleteViolation);

export default router;
