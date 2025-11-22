import { Router } from "express";

import { customerFeedback } from "../controllers/feedbackController";

const router = Router();

router.post("/feedback", customerFeedback);


export default router;
