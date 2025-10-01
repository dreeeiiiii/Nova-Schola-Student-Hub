import { Request, Response } from "express";
import { UserService } from "../services/user.service.js";
import { sign } from "../utils/jwt.js";

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });
  try {
    const user = await UserService.create(name, email, password);
    const token = sign({ id: (user as any).id, email: (user as any).email });
    res.status(201).json({ user, token });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });
  const user = await UserService.authenticate(email, password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const token = sign({ id: user.id, email: user.email });
  res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
}

export function profile(req: any, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const user = UserService.findById(userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}
