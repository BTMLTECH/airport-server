import { Router } from "express";
import { login, signup, verifyAdmin } from "../controllers/adminController";
import { authMiddleware } from "../utils/authMiddleware";

const router = Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/verify", authMiddleware, verifyAdmin);

export default router;
