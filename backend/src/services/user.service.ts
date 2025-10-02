import { query } from "../db.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export const UserService = {
  async create(
    name: string,
    email: string,
    password: string,
    role: "student" | "admin" = "student"
  ) {
    // Check if user with email exists
    const existing = await query(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase()]
    );
    
    if (existing && existing.rowCount && existing.rowCount > 0) {
      throw new Error("Email already in use");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 8);
    const id = uuidv4();

    // Insert user into database
    await query(
      `INSERT INTO users (id, name, email, password_hash, role) 
       VALUES ($1, $2, $3, $4, $5)`,
      [id, name, email.toLowerCase(), passwordHash, role]
    );

    return { id, name, email: email.toLowerCase(), role };
  },

  async authenticate(email: string, password: string) {
    const res = await query("SELECT * FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);
    if (res.rowCount === 0) return null;

    const user = res.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return null;

    const { password_hash, ...safeUser } = user;
    return safeUser;
  },

  async findById(id: string) {
    const res = await query("SELECT * FROM users WHERE id = $1", [id]);
    if (res.rowCount === 0) return null;

    const { password_hash, ...safeUser } = res.rows[0];
    return safeUser;
  },
};
