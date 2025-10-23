  import { query } from "../db.js";
  import { v4 as uuidv4, validate as isUuid } from "uuid";

  export const AnnouncementService = {
    // ---------------- READ ----------------
    async list(userId?: string, department?: string, role?: string) {
      const res = await query(
        `
        SELECT 
        a.id,
        a.title,
        a.author,
        a.target,
        a.content,
        a.date,
        a.image_url,
        a.created_at,
    
        COUNT(CASE WHEN ar.response = 'going' THEN 1 END) AS "goingCount",
        COUNT(CASE WHEN ar.response = 'notGoing' THEN 1 END) AS "notGoingCount",
        COUNT(CASE WHEN ar.response = 'notSure' THEN 1 END) AS "notSureCount",
    
        MAX(CASE WHEN ar.user_id = $1 THEN ar.response END) AS "userResponse"
    
      FROM announcements a
      LEFT JOIN announcement_responses ar ON a.id = ar.announcement_id
    
      WHERE
        $3 IN ('teacher', 'admin')                      -- teachers/admin see all
        OR (a.author ~* '^[a-f0-9-]{36}$' AND a.author::uuid = $1)
        OR a.target = 'ALL'                             -- public
        OR a.target = 'Students'                        -- all students
        OR ($2::text IS NOT NULL AND a.target = $2::text)  -- matches user's department if exists
    
      GROUP BY a.id
      ORDER BY a.created_at DESC
        `,
        [userId || null, department || null, role || null]
      );
    
      return res.rows;
    }
    
    
    ,
    
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
    },

    async getById(id: string) {
      const res = await query(
        `SELECT 
            id, 
            title, 
            author, 
            author_id AS "authorId", 
            target, 
            content, 
            date, 
            image_url AS "imageUrl", 
            created_at AS "createdAt"
        FROM announcements
        WHERE id = $1`,
        [id]
      );
      return res.rows[0] || null;
    },
    

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
      target: "All" | "BSIS" | "BSENTREP" | "BSAIS" | "BSCRIM";
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

    async removeResponse(userId: string, announcementId: string): Promise<void> {
      await query(
        `DELETE FROM announcement_responses WHERE user_id = $1 AND announcement_id = $2`,
        [userId, announcementId]
      );
    },
    
    // ---------------- Save or update announcement response ----------------
    async saveResponse(
      userId: string,
      announcementId: string,
      response: "going" | "notGoing" | "notSure"
    ): Promise<void> {
      const existingRes = await query(
        `SELECT id FROM announcement_responses WHERE announcement_id = $1 AND user_id = $2`,
        [announcementId, userId]
      );

      if ((existingRes.rowCount ?? 0) > 0) {
        // Update existing response
        await query(
          `UPDATE announcement_responses SET response = $1, responded_at = NOW() WHERE announcement_id = $2 AND user_id = $3`,
          [response, announcementId, userId]
        );
      } else {
        // Insert new response
        await query(
          `INSERT INTO announcement_responses (announcement_id, user_id, response) VALUES ($1, $2, $3)`,
          [announcementId, userId, response]
        );
      }
    },
    
  };
