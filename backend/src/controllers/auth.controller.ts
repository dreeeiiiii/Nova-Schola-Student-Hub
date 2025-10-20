import { Request, Response } from "express";
import { UserService } from "../services/user.service.js";
import { sign } from "../utils/jwt.js";

interface AuthedRequest extends Request {
  user?: { id: string; email: string };
}

export async function StudentRegister(req: Request, res: Response) {
  const { firstName, lastName, email, studentId, password, yearLevel, department } = req.body;
  if (!firstName || !lastName || !email || !studentId || !password || !yearLevel || !department) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const name = `${firstName} ${lastName}`.trim();
  try {
    const user = await UserService.createStudent(name, email, password, studentId, yearLevel, department);
    res.status(201).json({ message: "Student successfully registered", success: true, user });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}

export async function TeacherRegister(req: Request, res: Response) {
  const { firstName, lastName, email, employeeId, password, department, specialization } = req.body;
  if (!firstName || !lastName || !email || !employeeId || !password || !department || !specialization) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const name = `${firstName} ${lastName}`.trim();
  try {
    const teacher = await UserService.createTeacher(name, email, password, employeeId, department, specialization);
    res.status(201).json({ message: "Teacher successfully registered", success: true, teacher });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}

export async function AdminRegister(req: Request, res: Response) {
  const { firstName, lastName, email, password, yearLevel, department } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const name = `${firstName} ${lastName}`.trim();
  try {
    const admin = await UserService.createAdmin(name, email, password, yearLevel, department);
    res.status(201).json({ message: "Admin successfully registered", success: true, admin });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}

export async function StudentLogin(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Please fill in all required fields." });
  try {
    const user = await UserService.authenticateStudent(email.toLowerCase(), password);
    if (!user) return res.status(401).json({ message: "Invalid email or password." });
    const token = sign({ id: user.id, email: user.email, role: "student" }); // Include role
    res.json({ success: true, message: "Login successful", user, token });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function TeacherLogin(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Please fill in all required fields." });
  try {
    const teacher = await UserService.authenticateTeacher(email.toLowerCase(), password);
    if (!teacher) return res.status(401).json({ message: "Invalid email or password." });
    const token = sign({ id: teacher.id, email: teacher.email, role: "teacher" }); // Include role
    res.json({ success: true, message: "Login successful", teacher, token });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function AdminLogin(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Please fill in all required fields." });
  try {
    const admin = await UserService.authenticateAdmin(email.toLowerCase(), password);
    if (!admin) return res.status(401).json({ message: "Invalid email or password." });
    const token = sign({ id: admin.id, email: admin.email, role: "admin" }); // Include role
    res.json({ success: true, message: "Login successful", admin, token });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export async function profile(req: AuthedRequest, res: Response) {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    const user = await UserService.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
}
