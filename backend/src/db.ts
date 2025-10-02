import { Pool } from "pg";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable not set");
}

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Required for some managed DBs (adjust per your DB config)
  },
});

pool.on("error", (err:any) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log("executed query", { text, duration, rows: res.rowCount });
  return res;
}

export default pool;
