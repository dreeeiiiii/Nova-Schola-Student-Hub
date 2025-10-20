import { Request, Response, NextFunction } from "express";
import { verify } from "../utils/jwt.js";

export interface JwtPayload {
  id: string | number;
  email: string;
  role: "student" | "admin" | "teacher";
  iat?: number;
  exp?: number;
}

export interface AuthedRequest extends Request {
  user?: JwtPayload;
  file?: Express.Multer.File;
  files?:
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] };
}

// ✅ Auth middleware — safely handle numeric vs UUID IDs
export function authMiddleware(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header)
    return res.status(401).json({ error: "Missing Authorization header" });

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token)
    return res.status(401).json({ error: "Invalid Authorization format" });

  const decoded = verify(token);
  if (!decoded || typeof decoded === "string")
    return res.status(401).json({ error: "Invalid or expired token" });

  req.user = decoded as JwtPayload;   // keep id as UUID string
  next();
}


// 🛡️ Require Admin Role – for admin‑only endpoints
export function requireAdmin(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Access denied. Admins only." });
  next();
}
