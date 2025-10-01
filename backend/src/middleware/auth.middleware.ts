import { Request, Response, NextFunction } from "express";
import { verify } from "../utils/jwt.js";

export interface JwtPayload {
  id: string;
  email: string;
  role: "student" | "admin";
  iat?: number;
  exp?: number;
}

export interface AuthedRequest extends Request {
  user?: JwtPayload;
}

export function authMiddleware(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ error: "Missing Authorization header" });
  }

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Invalid Authorization format" });
  }

  const payload = verify(token);

  if (!payload || typeof payload === "string") {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  // payload is JwtPayload type
  req.user = payload as JwtPayload;

  next();
}
