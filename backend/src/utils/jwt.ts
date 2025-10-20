import jwt, { SignOptions, JwtPayload, Secret } from "jsonwebtoken";

// Ensure SECRET is always a valid Secret string
const SECRET: Secret = process.env.JWT_SECRET || "";

export interface UserPayload {
  id: string;
  role: "student" | "teacher"| "admin";
  email?: string; 
}

// Sign a JWT token with UserPayload and expiration (default 1 hour)
export function sign(payload: UserPayload, expiresIn: SignOptions["expiresIn"] = "1h"): string {
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
