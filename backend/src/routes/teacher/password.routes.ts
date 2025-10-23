// routes/teachers.routes.ts
import express from "express";
import bcrypt from "bcryptjs";
import { query } from "../../db.js";
import { AuthedRequest, authMiddleware } from "../../middleware/auth.middleware.js";

const router = express.Router();

// PUT /api/teachers/:id/password
router.put("/:id/password", authMiddleware, async (req: AuthedRequest, res, next) => {
  try {
    const teacherId = req.params.id;
    const userId = req.user?.id; // user from authMiddleware
    const { currentPassword, newPassword } = req.body;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    // Only allow teacher themselves or admin
    if (userId !== teacherId && req.user?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Get current password hash
    const result = await query("SELECT password_hash FROM teachers WHERE id = $1", [teacherId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const passwordHash = result.rows[0].password_hash;

    // Check current password
    const match = await bcrypt.compare(currentPassword, passwordHash);
    if (!match) return res.status(400).json({ error: "Current password is incorrect" });

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 8);

    // Update password
    await query("UPDATE teachers SET password_hash = $1 WHERE id = $2", [newHash, teacherId]);

    res.json({ ok: true, message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;
