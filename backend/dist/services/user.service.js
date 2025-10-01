import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
// In-memory user store (replace later with DB)
const users = [];
export const UserService = {
    async create(name, email, password, role = "student") {
        const existing = users.find((u) => u.email === email.toLowerCase());
        if (existing)
            throw new Error("Email already in use");
        const passwordHash = await bcrypt.hash(password, 8);
        const user = {
            id: uuidv4(),
            name,
            email: email.toLowerCase(),
            passwordHash,
            role,
        };
        users.push(user);
        // Return user without passwordHash
        const { passwordHash: _, ...safeUser } = user;
        return safeUser;
    },
    async authenticate(email, password) {
        const user = users.find((u) => u.email === email.toLowerCase());
        if (!user)
            return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok)
            return null;
        // Return safe user object
        const { passwordHash: _, ...safeUser } = user;
        return safeUser;
    },
    findById(id) {
        const user = users.find((u) => u.id === id);
        if (!user)
            return null;
        const { passwordHash: _, ...safeUser } = user;
        return safeUser;
    },
};
