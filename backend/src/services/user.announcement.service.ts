import { query } from "../db.js";
import { v4 as uuidv4, validate as isUuid } from "uuid";

export const AnnouncementService = {
  // ---------------- READ ----------------
  async list() {
    const res = await query(
      `SELECT id, title, author, target, content, date, image_url, created_at
         FROM announcements
         ORDER BY created_at DESC`
    );
    return res.rows;
  },
  
  async listByUser(userId: string) {
    const res = await query(
      `SELECT 
         id, title, author, target, content, date, image_url, created_at
       FROM announcements
       WHERE author_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    return res.rows;
  }
  
  ,
  async getById(id: string) {
    const res = await query(
      `SELECT id, title, author, target, content, date, image_url, created_at
         FROM announcements
         WHERE id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }
,  
  // ---------------- CREATE / UPDATE / DELETE ----------------
  async create({
    title,
    author,
    target,
    content,
    date,
    authorId,
    imageUrl,
  }: {
    title: string;
    author: string;
    target: "Students" | "Teachers";
    content: string;
    date?: string;
    authorId: string;
    imageUrl?: string | null;
  }) {
    try {
      const id = uuidv4();
      const creationDate = date || new Date().toISOString().split("T")[0];

      const res = await query(
        `INSERT INTO announcements
           (id, title, author, target, content, date, image_url, author_id, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
         RETURNING id, title, author, target, content, date, created_at;`,
        [id, title, author, target, content, creationDate, imageUrl, authorId]
      );
      return res.rows[0];
    } catch (error) {
      console.error("❌ SQL insert error (announcements):", error);
      throw error;
    }
  },

  async update(
    id: string,
    fields: {
      title?: string;
      author?: string;
      target?: string;
      content?: string;
      date?: string;
      imageUrl?: string;
    }
  ) {
    if (!isUuid(id)) return null;

    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        const dbField = key === "imageUrl" ? "image_url" : key;
        updates.push(`${dbField} = $${idx++}`);
        values.push(value);
      }
    }

    if (!updates.length) return null;
    values.push(id);

    const res = await query(
      `UPDATE announcements
         SET ${updates.join(", ")}, updated_at = NOW()
       WHERE id = $${idx}
       RETURNING id, title, author, target, content, date, created_at;`,
      values
    );
    return res.rows[0] || null;
  },

  async remove(id: string) {
    if (!isUuid(id)) return false;
    const res = await query(`DELETE FROM announcements WHERE id = $1`, [id]);
    return (res.rowCount ?? 0) > 0;
  },
};
