import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "supersecret"; // keep in .env

export function sign(payload: object, expiresIn: SignOptions["expiresIn"] = "1h"): string {
  return jwt.sign(payload, SECRET, { expiresIn });
}

export function verify(token: string): string | JwtPayload | null {
  try {
    return jwt.verify(token, SECRET) as string | JwtPayload;
  } catch {
    return null;
  }
}
