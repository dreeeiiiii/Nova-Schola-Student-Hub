// routes/students.routes.ts
import express from "express";
import bcrypt from "bcryptjs";
import { query } from "../../db.js";
import { AuthedRequest, authMiddleware } from "../../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/students/:id/profile
router.get("/:id/profile", authMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const studentId = req.params.id;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Only allow student themselves or admin
    if (userId !== studentId && req.user?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const result = await query(
      "SELECT id, full_name, email, class, created_at FROM students WHERE id = $1",
      [studentId]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: "Student not found" });

    res.json({ ok: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// PUT /api/students/:id/password
router.put("/:id/password", authMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const studentId = req.params.id;
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Only allow student themselves or admin
    if (userId !== studentId && req.user?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Fetch current password hash
    const result = await query("SELECT password_hash FROM students WHERE id = $1", [studentId]);

    if (result.rowCount === 0) return res.status(404).json({ error: "Student not found" });

    const passwordHash = result.rows[0].password_hash;

    // Check current password
    const match = await bcrypt.compare(currentPassword, passwordHash);
    if (!match) return res.status(400).json({ error: "Current password is incorrect" });

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 8);

    // Update password
    await query("UPDATE students SET password_hash = $1 WHERE id = $2", [newHash, studentId]);

    res.json({ ok: true, message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;
