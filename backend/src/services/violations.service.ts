import { query } from "../db.js";
import { v4 as uuidv4, validate as isUuid } from "uuid";

export const ViolationService = {
  async list() {
    const res = await query(
      `SELECT id, name, role, reason, reported_by AS "reportedBy",
              date, status
       FROM violations ORDER BY date DESC`
    );
    return res.rows;
  },

  async create({
    name,
    role,
    reason,
    reportedBy,
    date,
    status,
  }: {
    name: string;
    role: "Student" | "Teacher";
    reason: string;
    reportedBy: string;
    date?: string;
    status?: "Pending" | "Reviewed";
  }) {
    const id = uuidv4();
    const res = await query(
      `INSERT INTO violations (id, name, role, reason, reported_by, date, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING id, name, role, reason, reported_by AS "reportedBy", date, status`,
      [id, name, role, reason, reportedBy, date, status]
    );
    return res.rows[0];
  },

  async updateStatus(id: string, status: string) {
    if (!isUuid(id)) return null;
    const res = await query(
      `UPDATE violations SET status = $1 WHERE id = $2
       RETURNING id, name, role, reason, reported_by AS "reportedBy", date, status`,
      [status, id]
    );
    return res.rows[0] || null;
  },

  async remove(id: string) {
    if (!isUuid(id)) return false;
    const res = await query("DELETE FROM violations WHERE id = $1", [id]);
    return (res.rowCount ?? 0) > 0;
  },
};
