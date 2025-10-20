import { Router } from "express";
import { authMiddleware, requireAdmin } from "../middleware/auth.middleware.js";
import multer from "multer";
import path from "path";
import {
  listAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  listAnnouncementsForUser,
} from "../controllers/announcement.controller.js";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const router = Router();

// ✅ Custom Multer storage (uploads folder + timestamped filename)
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "nova-schola-announcements",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  } as any,
});

const upload = multer({ storage });

// ---------- Admin CRUD ----------
router.get("/", authMiddleware, listAnnouncements);
router.post("/", authMiddleware, requireAdmin, upload.single("file"), createAnnouncement);
router.put("/:id", authMiddleware, requireAdmin, upload.single("file"), updateAnnouncement);
router.delete("/:id", authMiddleware, requireAdmin, deleteAnnouncement);

// ---------- Authenticated users ----------
router.get("/user/me", authMiddleware, listAnnouncementsForUser);
router.get("/:id", authMiddleware, getAnnouncement);

export default router;
