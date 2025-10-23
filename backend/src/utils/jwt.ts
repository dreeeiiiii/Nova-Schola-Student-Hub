import jwt, { SignOptions, Secret } from "jsonwebtoken";

// Ensure SECRET is always a valid Secret string
const SECRET: Secret = process.env.JWT_SECRET || "";

// Extend payload to include optional name and department
export interface UserPayload {
  id: string;
  role: "student" | "teacher" | "admin";
  email?: string;
  name?: string;      // existing
  department?: string; // add department
}

// Sign a JWT token with extended UserPayload and expiration (default 1 hour)
export function sign(
  payload: UserPayload,
  expiresIn: SignOptions["expiresIn"] = "1h"
): string {
  return jwt.sign(payload, SECRET, { expiresIn });
}

// Verify token and return decoded payload or null if invalid
export function verify(token: string): UserPayload | null {
  try {
    return jwt.verify(token, SECRET) as UserPayload;
  } catch {
    return null; // token invalid or expired
  }
}

// OPTIONAL: helper to extract ID, name, and department from token on client-side
export function extractUserInfo(token: string): { id: string; name?: string; department?: string } | null {
  const payload = verify(token);
  if (!payload) return null;
  return { id: payload.id, name: payload.name, department: payload.department };
}
