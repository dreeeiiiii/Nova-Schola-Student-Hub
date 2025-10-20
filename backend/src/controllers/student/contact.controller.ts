import { Request, Response } from "express";
import * as contactsService from "../../services/student/contact.service.js";

export async function getContacts(req: Request, res: Response) {
  try {
    const role = req.query.role as string | undefined;
    const contacts = await contactsService.getAllContacts(role);

    // Add avatar initials if missing as before
    const contactsWithAvatars = contacts.map((c) => ({
      ...c,
      avatar:
        c.avatar ||
        c.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 3)
          .toUpperCase(),
    }));

    res.json(contactsWithAvatars);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
}

