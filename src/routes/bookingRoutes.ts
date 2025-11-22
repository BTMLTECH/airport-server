import { Router } from "express";
import { bookingController, verifyPayment } from "../controllers/bookingController";

const router = Router();

router.post("/booking", bookingController);
router.get("/verify-payment", verifyPayment);


export default router;
