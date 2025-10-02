import { Router } from "express";
import { getAnnouncement, createAnnouncement,listAnnouncements } from "../controllers/announcement.controller.js"; 
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();


router.get("/:id", getAnnouncement);
router.get("/",listAnnouncements);
//protected routes
router.post("/", authMiddleware, createAnnouncement);
  
export default router;
