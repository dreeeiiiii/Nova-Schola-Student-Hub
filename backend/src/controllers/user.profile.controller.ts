import { Request, Response } from "express";
import { query } from "../db.js";
import { AuthedRequest } from "../middleware/auth.middleware.js";
import bcrypt from "bcryptjs";

/* -------------------------------------------------------------------------- */
/*                           GENERIC HELPER FUNCTIONS                         */
/* -------------------------------------------------------------------------- */

async function getById(table: string, id: string | number) {
  const sql = `SELECT * FROM ${table} WHERE id = $1`;
  const result = await query(sql, [id]);  // 👈 passes UUIDs untouched
  return result.rows[0] || null;
}


async function deleteById(table: string, id: string | number) {
  const sql = `DELETE FROM ${table} WHERE id = $1 RETURNING id`;
  const result = await query(sql, [id]);   // no Number() conversion
  return result.rows[0] || null;
}

async function getAll(table: string) {
  const sql = `SELECT * FROM ${table} ORDER BY created_at DESC`;
  const result = await query(sql);
  return result.rows;
}

function sendNotFound(res: Response, entity = "Record") {
  return res.status(404).json({ message: `${entity} not found` });
}

function sendServerError(res: Response, error: any) {
  console.error(error);
  return res.status(500).json({ message: "Internal server error", error });
}

/* -------------------------------------------------------------------------- */
/*                               STUDENTS CRUD                                */
/* -------------------------------------------------------------------------- */

// ✅ Get current student profile
export const getCurrentStudent = async (req: AuthedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const studentId = req.user.id; // UUID string
    if (typeof studentId !== "string")
      return res.status(400).json({ error: "Invalid token ID type (expected string)" });

    const student = await getById("students", studentId);
    if (!student) return sendNotFound(res, "Student");
    res.status(200).json({ message: "Student fetched", data: student });
  } catch (error) {
    return sendServerError(res, error);
  }
};


// ✅ Update current student profile
export const updateCurrentStudent = async (
  req: AuthedRequest,
  res: Response
) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized: Missing token" });

    const userId = Number(req.user.id);
    if (isNaN(userId))
      return res
        .status(400)
        .json({ error: "Invalid token ID type (expected numeric)" });

    const { name, email, yearlevel, department } = req.body;

    const sql = `
      UPDATE students
      SET 
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        yearlevel = COALESCE($3, yearlevel),
        department = COALESCE($4, department),
        updated_at = NOW()
      WHERE id = $5
      RETURNING *;
    `;
    const result = await query(sql, [
      name,
      email,
      yearlevel,
      department,
      userId,
    ]);

    if (!result.rows.length) return sendNotFound(res, "Student");
    res.status(200).json({
      message: "Student profile updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    return sendServerError(res, error);
  }
};

// ✅ Get all students
export const getAllStudents = async (_req: Request, res: Response) => {
  try {
    const students = await getAll("students");
    res.status(200).json({ message: "Fetched all students", data: students });
  } catch (error) {
    sendServerError(res, error);
  }
};

export const getStudentById = async (req: Request, res: Response) => {
  try {
    const student = await getById("students", req.params.id);
    if (!student) return sendNotFound(res, "Student");
    res.status(200).json({ message: "Student fetched", data: student });
  } catch (error) {
    sendServerError(res, error);
  }
};

export const createStudent = async (req: Request, res: Response) => {
  const { name, email, password, studentid, yearlevel, department } = req.body;

  try {
    const password_hash = await bcrypt.hash(password, 10);

    // ✅ If no studentid supplied, auto-generate it
    const generatedId =
      studentid ||
      `NS${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;

    const sql = `
      INSERT INTO students 
        (name, email, password_hash, role, studentid, yearlevel, department, status)
      VALUES ($1, $2, $3, 'student', $4, $5, $6, 'Active')
      RETURNING id, name, email, studentid, yearlevel, department, status, created_at;
    `;
    const result = await query(sql, [
      name,
      email,
      password_hash,
      generatedId,
      yearlevel,
      department,
    ]);

    res.status(201).json({
      message: "Student account created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("❌ Error creating student:", error);
    sendServerError(res, error);
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid student ID" });

  const { name, email, studentid, yearlevel, department } = req.body;
  try {
    const sql = `
      UPDATE students
      SET name=$1, email=$2, studentid=$3, yearlevel=$4, department=$5, updated_at=NOW()
      WHERE id=$6
      RETURNING *;
    `;
    const result = await query(sql, [
      name,
      email,
      studentid,
      yearlevel,
      department,
      id,
    ]);
    if (!result.rows.length) return sendNotFound(res, "Student");
    res.status(200).json({ message: "Student updated", data: result.rows[0] });
  } catch (error) {
    sendServerError(res, error);
  }
};

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const deleted = await deleteById("students", req.params.id);
    if (!deleted) return sendNotFound(res, "Student");
    res.status(200).json({ message: "Student deleted", data: deleted });
  } catch (error) {
    sendServerError(res, error);
  }
};
export const toggleStudentStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "Missing student ID" });

    const { status } = req.body;
    const newStatus = status || "Active"; // optional safeguard

    const sql = `
      UPDATE students
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, email, yearlevel, department, status, updated_at;
    `;
    const result = await query(sql, [newStatus, id]);

    if (!result.rows.length) return sendNotFound(res, "Student");

    await query(
      "INSERT INTO activities (type, description, date) VALUES ($1,$2,NOW())",
      [
        "Status Changed",
        `Student ${result.rows[0].name} marked as ${newStatus}`,
      ]
    );

    res.status(200).json({
      message: "Student status updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error toggling student status:", error);
    sendServerError(res, error);
  }
};

/* -------------------------------------------------------------------------- */
/*                               TEACHERS CRUD                                */
/* -------------------------------------------------------------------------- */

// ✅ Get all teachers
export const getAllTeachers = async (_req: Request, res: Response) => {
  try {
    const sql = `
      SELECT id, name AS full_name, email, department,
             degree, school_from, specialization, experience_years, status, created_at
      FROM teachers
      ORDER BY created_at DESC;
    `;
    const result = await query(sql);
    res.status(200).json({ message: "Fetched all teachers", data: result.rows });
  } catch (error: any) {
    console.error("🚨 BACKEND ERROR /api/users/teachers:", error.message);
    if (error.stack) console.error(error.stack);
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

// ✅ Get teacher by ID (UUID-safe)
export const getTeacherById = async (req: Request, res: Response) => {
  try {
    const teacherId = req.params.id;
    if (!teacherId)
      return res.status(400).json({ error: "Missing teacher ID" });

    const sql = `
      SELECT id, name AS full_name, email, department,
             degree, school_from, specialization, experience_years,
             status, created_at
      FROM teachers
      WHERE id = $1;
    `;
    const result = await query(sql, [teacherId]);
    if (!result.rows.length) return sendNotFound(res, "Teacher");
    res.status(200).json({ message: "Teacher fetched", data: result.rows[0] });
  } catch (error) {
    console.error("Error fetching teacher by ID:", error);
    return sendServerError(res, error);
  }
};


// ✅ Create new teacher — always mark as created by admin
export const createTeacher = async (req: AuthedRequest, res: Response) => {
  const {
    full_name,
    email,
    password,
    department,
    degree,
    school_from,
    specialization,
    experience_years,
  } = req.body;

  try {
    if (!req.user || req.user.role !== "admin")
      return res.status(403).json({ error: "Only admins can create teachers" });

    const adminId = req.user.id; // taken from the verified JWT token

    const password_hash = await bcrypt.hash(password, 10);
    const sql = `
      INSERT INTO teachers
        (name, email, password_hash, department, degree, school_from, specialization,
         experience_years, role, status, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'teacher','Active',$9)
      RETURNING id, name AS full_name, email, department,
                degree, school_from, specialization, experience_years, status,
                created_by, created_at;
    `;

    const result = await query(sql, [
      full_name,
      email,
      password_hash,
      department,
      degree,
      school_from,
      specialization,
      experience_years || 0,
      adminId,
    ]);

    await query(
      "INSERT INTO activities (type, description, date) VALUES ($1,$2,NOW())",
      ["New Teacher", `Teacher ${full_name} registered for ${department} by admin ID ${adminId}`]
    );

    return res
      .status(201)
      .json({ message: "Teacher account created", data: result.rows[0] });
  } catch (error) {
    console.error("Error creating teacher:", error);
    return sendServerError(res, error);
  }
};


// ✅ Update teacher
export const updateTeacher = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ error: "Missing teacher ID" });

  const {
    full_name,
    email,
    department,
    degree,
    school_from,
    specialization,
    experience_years,
    status,
  } = req.body;

  try {
    const sql = `
      UPDATE teachers
      SET name = COALESCE($1,name),
          email = COALESCE($2,email),
          department = COALESCE($3,department),
          degree = COALESCE($4,degree),
          school_from = COALESCE($5,school_from),
          specialization = COALESCE($6,specialization),
          experience_years = COALESCE($7,experience_years),
          status = COALESCE($8,status),
          updated_at = NOW()
      WHERE id = $9
      RETURNING id, name AS full_name, email, department,
                degree, school_from, specialization, experience_years, status, updated_at;
    `;
    const result = await query(sql, [
      full_name,
      email,
      department,
      degree,
      school_from,
      specialization,
      experience_years,
      status,
      id,
    ]);
    if (!result.rows.length) return sendNotFound(res, "Teacher");

    await query(
      "INSERT INTO activities (type, description, date) VALUES ($1,$2,NOW())",
      ["Update Teacher", `Teacher ${full_name || id} profile updated`]
    );

    res.status(200).json({ message: "Teacher updated", data: result.rows[0] });
  } catch (error) {
    console.error("Error updating teacher:", error);
    return sendServerError(res, error);
  }
};

// ✅ Delete teacher
export const deleteTeacher = async (req: Request, res: Response) => {
  try {
    const teacherId = req.params.id;
    if (!teacherId)
      return res.status(400).json({ error: "Missing teacher ID" });

    const sql =
      "DELETE FROM teachers WHERE id=$1 RETURNING id,name AS full_name;";
    const result = await query(sql, [teacherId]);
    if (!result.rows.length) return sendNotFound(res, "Teacher");

    await query(
      "INSERT INTO activities (type, description, date) VALUES ($1,$2,NOW())",
      [
        "Delete Teacher",
        `Teacher ${result.rows[0].full_name || teacherId} deleted`,
      ]
    );

    res.status(200).json({ message: "Teacher deleted", data: result.rows[0] });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return sendServerError(res, error);
  }
};

// ✅ Toggle teacher status
export const toggleTeacherStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "Missing teacher ID" });
    const { status } = req.body;

    const sql = `
      UPDATE teachers
      SET status=$1, updated_at=NOW()
      WHERE id=$2
      RETURNING id, name AS full_name, email, department,
                degree, school_from, specialization, experience_years, status;
    `;
    const result = await query(sql, [status, id]);
    if (!result.rows.length) return sendNotFound(res, "Teacher");

    await query(
      "INSERT INTO activities (type, description, date) VALUES ($1,$2,NOW())",
      [
        "Status Changed",
        `Teacher ${result.rows[0].full_name} marked as ${status}`,
      ]
    );

    res.status(200).json({ message: "Status updated", data: result.rows[0] });
  } catch (error) {
    console.error("Error toggling teacher status:", error);
    return sendServerError(res, error);
  }
};
