import { Router } from "express";
import { bookingController, verifyPayment } from "../controllers/bookingController";
import uploadDocument from "../utils/upload";
import { traacBooking } from "../controllers/traacBoongController";


const router = Router();

router.post("/booking", bookingController);
// router.post("/traacbooking", uploadDocument.single("file"), traacBooking);
router.post("/traacbooking", (req, res, next) => {
  const contentType = req.headers["content-type"];
  if (contentType && contentType.includes("multipart/form-data")) {
    uploadDocument.single("file")(req, res, next);
  } else {
    next();
  }
}, traacBooking);
router.get("/verify-payment", verifyPayment);


export default router;
