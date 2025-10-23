import { Response } from "express";
import { AnnouncementService } from "../services/user.announcement.service.js";
import { AuthedRequest } from "../middleware/auth.middleware.js";

/* -------------------------------------------------------------------------- */
/*                                Announcements                               */
/* -------------------------------------------------------------------------- */

// ✅ List all announcements (Admin dashboard)
export async function listAnnouncements(req: AuthedRequest, res: Response) {
  try {
    const userId = req.user?.id ? String(req.user.id) : undefined;
    const department = req.user?.department || undefined;
    const role = req.user?.role || undefined;

    const announcements = await AnnouncementService.list(userId, department, role);
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

    // Allow only admins and teachers to create announcements
    const allowedRoles = ["admin", "teacher"];
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Only admins or teachers can create announcements." });
    }

    if (!title || !author || !target || !content) {
      console.warn("⚠️ Missing required fields:", req.body);
      return res.status(400).json({ error: "Missing required fields." });
    }

    const userId = String(req.user.id);

    // Cloudinary file path if file uploaded
    const imageUrl = req.file ? req.file.path : null;

    const announcement = await AnnouncementService.create({
      title,
      author,
      target,
      content,
      date: new Date().toISOString().split("T")[0],
      authorId: userId,
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
    if (!id) return res.status(400).json({ error: "Missing announcement ID." });

    // Fetch existing announcement to verify ownership
    const existing = await AnnouncementService.getById(id);
    if (!existing) return res.status(404).json({ error: "Announcement not found." });

    // Check if the authenticated user owns this announcement
    if (existing.authorId !== req.user?.id && req.user?.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to update this announcement." });
    }

    // Prepare fields to update from request body
    const { title, author, target, content } = req.body;
    const fields: any = {};
    if (title !== undefined) fields.title = title;
    if (author !== undefined) fields.author = author;
    if (target !== undefined) fields.target = target;
    if (content !== undefined) fields.content = content;

    // Include uploaded image if present
    if (req.file && req.file.path) fields.imageUrl = req.file.path;

    // Update the announcement
    const updated = await AnnouncementService.update(id, fields);
    if (!updated) return res.status(404).json({ error: "Announcement not found." });

    res.json({ data: updated });
  } catch (err) {
    console.error("❌ Error updating announcement:", err);
    res.status(500).json({ error: "Failed to update announcement." });
  }
}

export async function deleteAnnouncement(req: AuthedRequest, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Missing announcement ID." });

    // Fetch existing announcement to verify ownership
    const existing = await AnnouncementService.getById(id);
    if (!existing) return res.status(404).json({ error: "Announcement not found." });

    // Check if the authenticated user owns this announcement
    if (existing.authorId !== req.user?.id && req.user?.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to delete this announcement." });
    }

    // Delete the announcement
    const deleted = await AnnouncementService.remove(id);
    if (!deleted) return res.status(404).json({ error: "Announcement not found." });

    res.json({ message: "Announcement deleted successfully." });
  } catch (err) {
    console.error("❌ Error deleting announcement:", err);
    res.status(500).json({ error: "Failed to delete announcement." });
  }
}
  


export async function saveResponse(req: AuthedRequest, res: Response): Promise<Response> {
  const announcementId = req.params.id;
  const userId = req.user?.id;
  const response: "going" | "notGoing" | "notSure" | null = req.body.response ?? null;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!announcementId) return res.status(400).json({ error: "Missing announcement ID." });

  // Allow null for undo
  const validResponses = ["going", "notGoing", "notSure"];
  if (response !== null && !validResponses.includes(response)) {
    return res.status(400).json({ error: "Invalid response value." });
  }

  const userIdStr = String(userId); // Explicit conversion to string

  try {
    if (response === null) {
      // Delete existing response to undo
      await AnnouncementService.removeResponse(userIdStr, announcementId);
    } else {
      // Insert or update
      await AnnouncementService.saveResponse(userIdStr, announcementId, response);
    }
    return res.status(200).json({ message: "Response recorded" });
  } catch (err) {
    console.error("Error saving response:", err);
    return res.status(500).json({ error: "Failed to save response." });
  }
}



