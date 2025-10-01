import { Router } from "express";

const router = Router();

// Example chat route
router.get("/", (req, res) => {
  res.json({ message: "Chat route working!" });
});

export default router;
