import { Router } from "express";

const router = Router();

// Example get announcements route
router.get("/", (req, res) => {
  res.json([{ id: 1, title: "Welcome Week", body: "Classes start Monday!" }]);
});

export default router;
