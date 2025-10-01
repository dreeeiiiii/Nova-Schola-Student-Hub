import { AnnouncementService } from "../services/user.announcement.service.js";
// List all announcements
export function listAnnouncements(req, res) {
    const announcements = AnnouncementService.list();
    res.json(announcements);
}
// Get a single announcement by ID
export function getAnnouncement(req, res) {
    const { id } = req.params;
    if (!id)
        return res.status(400).json({ error: "Missing announcement ID" });
    const ann = AnnouncementService.getById(id);
    if (!ann)
        return res.status(404).json({ error: "Announcement not found" });
    res.json(ann);
}
// Create a new announcement (requires auth)
export function createAnnouncement(req, res) {
    const { title, body } = req.body;
    if (!title || !body) {
        return res.status(400).json({ error: "Missing title or body" });
    }
    // Author ID from JWT payload
    const authorId = req.user?.id;
    if (!authorId)
        return res.status(401).json({ error: "Unauthorized" });
    const announcement = AnnouncementService.create(title, body, authorId);
    res.status(201).json(announcement);
}
