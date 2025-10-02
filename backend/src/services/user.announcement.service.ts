import { query } from "../db.js";
import { v4 as uuidv4 } from "uuid";

export const AnnouncementService = {
  async list() {
    const res = await query("SELECT * FROM announcements ORDER BY created_at DESC");
    return res.rows;
  },
  async getById(id: string) {
    const res = await query("SELECT * FROM announcements WHERE id = $1", [id]);
    return res.rows[0] || null;
  },
  async create(title: string, body: string, authorId: string) {
    const id = uuidv4();
    const res = await query(
      "INSERT INTO announcements (id, title, body, author_id, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
      [id, title, body, authorId]
    );
    return res.rows[0];
  },
  async update(id: string, title?: string, body?: string) {
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;
    if (title) {
      updates.push(`title = $${idx++}`);
      values.push(title);
    }
    if (body) {
      updates.push(`body = $${idx++}`);
      values.push(body);
    }
    if (!updates.length) return null;
    values.push(id);
    const res = await query(
      `UPDATE announcements SET ${updates.join(", ")}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,
      values
    );
    return res.rows[0] || null;
  },
  async remove(id: string) {
    const res = await query("DELETE FROM announcements WHERE id = $1", [id]);
    return (res.rowCount ?? 0) > 0;
  }
  
};
