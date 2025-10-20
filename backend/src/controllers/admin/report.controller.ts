import { Response } from "express";
import { query } from "../../db.js";
import { AuthedRequest } from "../../middleware/auth.middleware.js";

export async function getAdminAnalytics(req: AuthedRequest, res: Response) {
  try {
    // ─── Totals ────────────────────────────────
    const students = await query("SELECT COUNT(*) FROM students");
    const teachers = await query("SELECT COUNT(*) FROM teachers");
    const violations = await query("SELECT COUNT(*) FROM violations");
    const announcements = await query("SELECT COUNT(*) FROM announcements");

    // ─── Violations trend: daily counts (past 7 days) ────────────
    const violationTrend = await query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('day', date), 'Dy') AS day,
        COUNT(*)::int AS count
      FROM violations
      WHERE date >= NOW() - INTERVAL '7 days'
      GROUP BY DATE_TRUNC('day', date)
      ORDER BY DATE_TRUNC('day', date)
    `);

    // ─── Activities trend: daily counts (past 7 days) ────────────
    const activityTrend = await query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('day', date), 'Dy') AS day,
        COUNT(*)::int AS count
      FROM activities
      WHERE date >= NOW() - INTERVAL '7 days'
      GROUP BY DATE_TRUNC('day', date)
      ORDER BY DATE_TRUNC('day', date)
    `);

    // ─── Optional: last 10 recent activities ─────────────────────
    const recentActivities = await query(`
      SELECT id, type, description, 
             TO_CHAR(date, 'YYYY-MM-DD HH24:MI') AS date
      FROM activities
      ORDER BY date DESC
      LIMIT 10
    `);

    // ─── Response ──────────────────────────────
    res.json({
      data: {
        totalStudents: parseInt(students.rows[0].count),
        totalTeachers: parseInt(teachers.rows[0].count),
        totalViolations: parseInt(violations.rows[0].count),
        totalAnnouncements: parseInt(announcements.rows[0].count),
        violationsTrend: violationTrend.rows,
        activityTrend: activityTrend.rows,
        recentActivities: recentActivities.rows,
      },
    });
  } catch (err) {
    console.error("❌ Error fetching admin analytics:", err);
    res.status(500).json({ error: "Failed to fetch analytics data." });
  }
}
