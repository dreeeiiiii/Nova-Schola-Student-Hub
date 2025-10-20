import { query } from "../db.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export const UserService = {
  
  async createStudent(name: string, email: string, password: string, studentId: string, yearLevel: string, department: string) {
    const existing = await query("SELECT id FROM students WHERE email = $1", [email.toLowerCase()]);
    if (existing.rowCount?? 0 > 0) throw new Error("Email already in use");

    const passwordHash = await bcrypt.hash(password, 8);
    const id = uuidv4();

    await query(
      `INSERT INTO students (id, name, email, password_hash, role, studentId, yearLevel, department)
       VALUES ($1, $2, $3, $4, 'student', $5, $6, $7)`,
      [id, name, email.toLowerCase(), passwordHash, studentId, yearLevel, department]
    );

    return { id, name, email: email.toLowerCase(), role: "student", studentId, yearLevel, department };
  },


  async createTeacher(name: string, email: string, password: string, teacherId: string, department: string, specialization: string) {
    const existing = await query("SELECT id FROM teachers WHERE email = $1", [email.toLowerCase()]);
    if (existing.rowCount??0 > 0) throw new Error("Email already in use");

    const passwordHash = await bcrypt.hash(password, 8);
    const id = uuidv4();

    await query(
      `INSERT INTO teachers (id, name, email, password_hash, role, teacherId, department, specialization)
       VALUES ($1, $2, $3, $4, 'teacher', $5, $6, $7)`,
      [id, name, email.toLowerCase(), passwordHash, teacherId, department, specialization]
    );

    return { id, name, email: email.toLowerCase(), role: "teacher", teacherId, department, specialization };
  },

 
  async createAdmin(name: string, email: string, password: string, yearLevel: string, department: string) {
    const existing = await query("SELECT id FROM admins WHERE email = $1", [email.toLowerCase()]);
    if (existing.rowCount ?? 0 > 0) throw new Error("Email already in use");

    const passwordHash = await bcrypt.hash(password, 8);
    const id = uuidv4();

    await query(
      `INSERT INTO admins (id, name, email, password_hash, role, yearLevel, department)
       VALUES ($1, $2, $3, $4, 'admin', $5, $6)`,
      [id, name, email.toLowerCase(), passwordHash, yearLevel, department]
    );

    return { id, name, email: email.toLowerCase(), role: "admin", yearLevel, department };
  },


  async authenticateStudent(email: string, password: string) {
    const res = await query("SELECT * FROM students WHERE LOWER(email) = LOWER($1)", [email]);
    if (res.rowCount === 0) return null;
    const student = res.rows[0];
    if (!(await bcrypt.compare(password, student.password_hash))) return null;
    delete student.password_hash;
    return student;
  },

  async authenticateTeacher(email: string, password: string) {
    const res = await query("SELECT * FROM teachers WHERE LOWER(email) = LOWER($1)", [email]);
    if (res.rowCount === 0) return null;
    const teacher = res.rows[0];
    if (!(await bcrypt.compare(password, teacher.password_hash))) return null;
    delete teacher.password_hash;
    return teacher;
  },

  async authenticateAdmin(email: string, password: string) {
    const res = await query("SELECT * FROM admins WHERE LOWER(email) = LOWER($1)", [email]);
    if (res.rowCount === 0) return null;
    const admin = res.rows[0];
    if (!(await bcrypt.compare(password, admin.password_hash))) return null;
    delete admin.password_hash;
    return admin;
  },

  
  async findById(id: string) {
    const tables = ["students", "teachers", "admins"];
    for (const table of tables) {
      const res = await query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
      if (res.rowCount?? 0 > 0) {
        const user = res.rows[0];
        delete user.password_hash;
        return user;
      }
    }
    return null;
  },
};
