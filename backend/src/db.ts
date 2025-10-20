// src/db/client.ts
import { Pool } from "pg";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable not set");
}

// Create a pool
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // adjust based on your DB
  },
});

pool.on("error", (err: any) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// ✅ Query helper
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("executed query", { text, duration, rows: res.rowCount });
    return res;
  } catch (error: any) {
    console.error("🚨 SQL ERROR:");
    console.error("Query:", text);
    console.error("Params:", params);
    console.error("Message:", error.message);
    if (error.stack) console.error(error.stack);
    throw error;
  }
}

// Export the pool as client for easier usage
export const client = pool;

export default pool;
