import pool from "../../db.js";

export interface Contact {
  avatar: string;
  id: string;
  name: string;
  email: string;
  contactid: string;
  department: string;
  role: string;
  status: string;
  specialization?: string | null;
  degree?: string | null;
  experience_years?: number | null;
  yearlevel?: string | null;
}
export async function getAllContacts(role?: string): Promise<Contact[]> {
    let rolesToFilter: string[] | null = null;
  
    if (role) {
      const roleNormalized = role.toLowerCase();
      if (roleNormalized === "teachers" || roleNormalized === "teacher") {
        rolesToFilter = ["teacher"];
      } else if (roleNormalized === "students" || roleNormalized === "student") {
        rolesToFilter = ["student"];
      }
    }
  
    let baseQuery = `
      SELECT
        id,
        name,
        email,
        teacherid AS contactid,
        department,
        role,
        status,
        specialization,
        degree,
        experience_years,
        NULL::varchar AS yearlevel
      FROM teachers
    `;
  
    let unionQuery = `
      SELECT
        id,
        name,
        email,
        studentid AS contactid,
        department,
        role,
        status,
        NULL AS specialization,
        NULL AS degree,
        NULL AS experience_years,
        yearlevel
      FROM students
    `;
  
    if (rolesToFilter) {
      if (rolesToFilter.includes("teacher") && !rolesToFilter.includes("student")) {
        // Only teachers
        baseQuery += ` WHERE role = 'teacher' `;
        unionQuery = "";
      } else if (rolesToFilter.includes("student") && !rolesToFilter.includes("teacher")) {
        // Only students
        unionQuery += ` WHERE role = 'student' `;
        baseQuery = "";
      }
    }
  
    let fullQuery = "";
    if (baseQuery && unionQuery) {
      fullQuery = `${baseQuery} UNION ALL ${unionQuery} ORDER BY name;`;
    } else if (baseQuery) {
      fullQuery = `${baseQuery} ORDER BY name;`;
    } else if (unionQuery) {
      fullQuery = `${unionQuery} ORDER BY name;`;
    } else {
      return [];
    }
  
    const { rows } = await pool.query(fullQuery);
    return rows;
  }
  
  
