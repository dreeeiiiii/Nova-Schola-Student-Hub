import { Response } from "express";
import { AnnouncementService } from "../services/user.announcement.service.js";
import { AuthedRequest } from "../middleware/auth.middleware.js";

/* -------------------------------------------------------------------------- */
/*                                Announcements                               */
/* -------------------------------------------------------------------------- */

// ✅ List all announcements (Admin dashboard)
export async function listAnnouncements(req: AuthedRequest, res: Response) {
  try {
    const announcements = await AnnouncementService.list();
    res.json({ data: announcements });
  } catch (err) {
    console.error("❌ Error listing announcements:", err);
    res.status(500).json({ error: "Failed to fetch announcements." });
  }
}

// ✅ Get announcement by ID
export async function getAnnouncement(req: AuthedRequest, res: Response) {
  const { id } = req.params;
  if (!id)
    return res.status(400).json({ error: "Missing announcement ID." });

  try {
    const ann = await AnnouncementService.getById(id);
    if (!ann)
      return res.status(404).json({ error: "Announcement not found." });
    res.json({ data: ann });
  } catch (err) {
    console.error("❌ Error fetching announcement:", err);
    res.status(500).json({ error: "Failed to fetch announcement." });
  }
}

// ✅ List announcements for logged‑in user (student / teacher)
export async function listAnnouncementsForUser(req: AuthedRequest, res: Response) {
  if (!req.user?.id)
    return res.status(401).json({ error: "Unauthorized" });

  try {
    const userId = String(req.user.id);
    const announcements = await AnnouncementService.listByUser(userId);
    res.json({ data: announcements });
  } catch (err) {
    console.error("❌ Error fetching user announcements:", err);
    res.status(500).json({ error: "Failed to fetch user announcements." });
  }
}

// ✅ Create new announcement (Admin‑only)
export async function createAnnouncement(req: AuthedRequest, res: Response) {
  try {
    const { title, author, target, content } = req.body;
    if (!req.user || req.user.role !== "admin")
      return res.status(403).json({ error: "Only admins can create announcements." });

    if (!title || !author || !target || !content) {
      console.warn("⚠️ Missing required fields:", req.body);
      return res.status(400).json({ error: "Missing required fields." });
    }

    const adminId = String(req.user.id);

    // ✅ If using Cloudinary storage, file.path contains full Cloudinary URL
    const imageUrl = req.file ? req.file.path : null;

    const announcement = await AnnouncementService.create({
      title,
      author,
      target,
      content,
      date: new Date().toISOString().split("T")[0],
      authorId: adminId,
      imageUrl,
    });

    res.status(201).json({ data: announcement });
  } catch (error) {
    console.error("❌ Error creating announcement:", error);
    res.status(500).json({ error: "Failed to create announcement." });
  }
}

// ✅ Update existing announcement
export async function updateAnnouncement(req: AuthedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, author, target, content } = req.body;
    if (!id)
      return res.status(400).json({ error: "Missing announcement ID." });

    const fields: any = { title, author, target, content };

    // ✅ If updating image as well
    if (req.file && req.file.path) fields.imageUrl = req.file.path;

    const updated = await AnnouncementService.update(id, fields);
    if (!updated)
      return res.status(404).json({ error: "Announcement not found." });

    res.json({ data: updated });
  } catch (err) {
    console.error("❌ Error updating announcement:", err);
    res.status(500).json({ error: "Failed to update announcement." });
  }
}

// ✅ Delete announcement
export async function deleteAnnouncement(req: AuthedRequest, res: Response) {
  try {
    const { id } = req.params;
    if (!id)
      return res.status(400).json({ error: "Missing announcement ID." });

    const deleted = await AnnouncementService.remove(id);
    if (!deleted)
      return res.status(404).json({ error: "Announcement not found." });

    res.json({ message: "Announcement deleted successfully." });
  } catch (err) {
    console.error("❌ Error deleting announcement:", err);
    res.status(500).json({ error: "Failed to delete announcement." });
  }
}
