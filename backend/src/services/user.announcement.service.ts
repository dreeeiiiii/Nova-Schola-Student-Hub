import { Announcement } from "../models/announcement.model.js";
import { v4 as uuidv4 } from "uuid";


const announcements: Announcement[] = [];


export const AnnouncementService = {
list() {
return announcements.slice().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
},
getById(id: string) {
return announcements.find((a) => a.id === id) || null;
},
create(title: string, body: string, authorId: string) {
const ann: Announcement = { id: uuidv4(), title, body, authorId, createdAt: new Date().toISOString() };
announcements.push(ann);
return ann;
},
update(id: string, title?: string, body?: string) {
const ann = announcements.find((a) => a.id === id);
if (!ann) return null;
if (title) ann.title = title;
if (body) ann.body = body;
ann.updatedAt = new Date().toISOString();
return ann;
},
remove(id: string) {
const idx = announcements.findIndex((a) => a.id === id);
if (idx === -1) return false;
announcements.splice(idx, 1);
return true;
},
};