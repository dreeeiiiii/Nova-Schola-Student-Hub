import { AuthedRequest } from "./auth.middleware.js";
import { Response, NextFunction } from "express";

/**
 * Converts req.user.id to Number if it looks numeric.
 * Keeps UUIDs as strings.
 */
export function normalizeUserId(
  req: AuthedRequest,
  res: Response,
  next: NextFunction
) {
  if (req.user?.id && typeof req.user.id === "string") {
    const maybeNum = Number(req.user.id);
    if (!isNaN(maybeNum)) req.user.id = maybeNum;
  }
  next();
}
