import { Router } from "express";
import { bookingController, verifyPayment } from "../controllers/bookingController";
import uploadDocument from "../utils/upload";
import { traacBooking } from "../controllers/traacBoongController";


const router = Router();

router.post("/booking", bookingController);
router.post("/traacbooking", uploadDocument.single("file"), traacBooking);
router.get("/verify-payment", verifyPayment);


export default router;
