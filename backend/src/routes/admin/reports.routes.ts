import { Router } from "express";
import { getAdminAnalytics } from "../../controllers/admin/report.controller.js";
import { authMiddleware, requireAdmin } from "../../middleware/auth.middleware.js";

const router = Router();

// Admin dashboard analytics
router.get("/analytics", authMiddleware, requireAdmin, getAdminAnalytics);

export default router;
