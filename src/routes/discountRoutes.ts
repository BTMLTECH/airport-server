import { Router } from "express";
import { authMiddleware } from "../utils/authMiddleware";
import { createDiscount, verifyDiscount } from "../controllers/discountController";

const router = Router();

router.post("/create", authMiddleware, createDiscount);
router.post("/discount",  verifyDiscount);


export default router;
