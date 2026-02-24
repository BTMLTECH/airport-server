import { Router } from "express";

import { customerFeedback, exportFeedbackByMonth } from "../controllers/feedbackController";

const router = Router();

router.post("/feedback", customerFeedback);
router.get("/feedback/export", exportFeedbackByMonth);


export default router;
