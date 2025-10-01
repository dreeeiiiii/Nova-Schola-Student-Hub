import jwt from "jsonwebtoken";
const SECRET = process.env.JWT_SECRET || "supersecret"; // keep in .env
export function sign(payload, expiresIn = "1h") {
    return jwt.sign(payload, SECRET, { expiresIn });
}
export function verify(token) {
    try {
        return jwt.verify(token, SECRET);
    }
    catch {
        return null;
    }
}
