import { Router } from "express";
const router = Router();
// Example login route
router.post("/login", (req, res) => {
    res.json({ message: "Login route working!" });
});
export default router;
