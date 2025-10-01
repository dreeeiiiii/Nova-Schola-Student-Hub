import { verify } from "../utils/jwt.js";
export function authMiddleware(req, res, next) {
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
    req.user = payload;
    next();
}
