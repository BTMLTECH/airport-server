import { Router } from "express";
import { createDetail } from "../controllers/customerController";

const router = Router();

router.post("/customer", createDetail);


export default router;
