import { Request, Response } from "express";
import pool from "../../db.js";

// ---------- Generic Query Type ----------
interface QueryResult<T> {
  rows: T[];
}

// ---------- Data Models ----------
interface Student {
  id: number;
  name: string;
  email: string;
  department: string;
  year_level: number;
  created_at: string;
}

interface Teacher {
  id: number;
  name: string;
  email: string;
  department: string;
  created_at: string;
}

interface Announcement {
  id: number;
  title: string;
  content: string;
  author_id: number | null;
  created_at: string;
}

interface Violation {
  id: number;
  student_id: number;
  type: string;
  description: string;
  date_reported: string;
}

interface Activity {
  id: number;
  type: string;
  description: string;
  date: string;
}

// ---------- Dashboard Overview ----------
export const getDashboardOverview = async (_req: Request, res: Response): Promise<void> => {
  try {
    const programMap: Record<string, string> = {
      BSIS: "BS Information System (BSIS)",
      BSAIS: "BS Accounting Information System (BSAIS)",
      BSCRIM: "BS Criminology (BSCRIM)",
      BSENTREP: "BS Entrepreneurship (BSENTREP)",
      BTVED: "Bachelor of Technical‑Vocational Teacher Education (BTVED)",
    };
    const codes = Object.keys(programMap);

    const [students, teachers, announcements, violations, dbPrograms, activities] =
      await Promise.all([
        pool.query("SELECT COUNT(*) FROM students"),
        pool.query("SELECT COUNT(*) FROM teachers"),
        pool.query("SELECT COUNT(*) FROM announcements"),
        pool.query("SELECT COUNT(*) FROM violations"),
        pool.query(`
          SELECT UPPER(department) AS code, COUNT(*) AS value
          FROM students
          WHERE department IS NOT NULL
          GROUP BY UPPER(department)
          ORDER BY UPPER(department);
        `),
        pool.query(`
          SELECT id, type, description,
                 TO_CHAR(date, 'YYYY-MM-DD HH24:MI') AS date
          FROM activities
          ORDER BY date DESC
          LIMIT 10;
        `),
      ]);

    const existing: Record<string, number> = {};
    for (const row of dbPrograms.rows) existing[row.code] = Number(row.value);

    const distribution = codes.map((code) => ({
      name: programMap[code],
      value: existing[code] || 0,
    }));

    res.json({
      stats: {
        totalStudents: +students.rows[0].count,
        totalTeachers: +teachers.rows[0].count,
        totalAnnouncements: +announcements.rows[0].count,
        totalViolations: +violations.rows[0].count,
      },
      userDistribution: distribution,
      recentActivities: activities.rows,
    });
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    res.status(500).json({ error: "Failed to load dashboard overview" });
  }
};





// ---------- Students ----------
export const getStudents = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result: QueryResult<Student> = await pool.query(
      "SELECT * FROM students ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch students error:", err);
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

export const addStudent = async (req: Request, res: Response): Promise<void> => {
  const { name, email, department, year_level } = req.body;
  try {
    const result: QueryResult<Student> = await pool.query(
      "INSERT INTO students (name, email, department, year_level) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, department, year_level]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Add student error:", err);
    res.status(500).json({ error: "Failed to add student" });
  }
};

// ---------- Teachers ----------
export const getTeachers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result: QueryResult<Teacher> = await pool.query(
      "SELECT * FROM teachers ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch teachers error:", err);
    res.status(500).json({ error: "Failed to fetch teachers" });
  }
};

export const addTeacher = async (req: Request, res: Response): Promise<void> => {
  const { name, email, department } = req.body;
  try {
    const result: QueryResult<Teacher> = await pool.query(
      "INSERT INTO teachers (name, email, department) VALUES ($1, $2, $3) RETURNING *",
      [name, email, department]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Add teacher error:", err);
    res.status(500).json({ error: "Failed to add teacher" });
  }
};

// ---------- Announcements ----------
export const getAnnouncements = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const result: QueryResult<Announcement> = await pool.query(
      "SELECT * FROM announcements ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch announcements error:", err);
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
};

export const addAnnouncement = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { title, content, author_id } = req.body;
  try {
    const result: QueryResult<Announcement> = await pool.query(
      "INSERT INTO announcements (title, content, author_id) VALUES ($1, $2, $3) RETURNING *",
      [title, content, author_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Add announcement error:", err);
    res.status(500).json({ error: "Failed to add announcement" });
  }
};

// ---------- Violations ----------
export const getViolations = async (_req: Request, res: Response): Promise<void> => {
  try {
    const result: QueryResult<Violation> = await pool.query(`
      SELECT v.*, s.name AS student_name 
      FROM violations v 
      LEFT JOIN students s ON v.student_id = s.id
      ORDER BY date_reported DESC;
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch violations error:", err);
    res.status(500).json({ error: "Failed to fetch violations" });
  }
};

export const addViolation = async (req: Request, res: Response): Promise<void> => {
  const { student_id, type, description } = req.body;
  try {
    const result: QueryResult<Violation> = await pool.query(
      "INSERT INTO violations (student_id, type, description) VALUES ($1, $2, $3) RETURNING *",
      [student_id, type, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Add violation error:", err);
    res.status(500).json({ error: "Failed to add violation" });
  }
};
