import express from "express";
import { protect } from "../../Middleware/authe.js";
import { getAiStatus, setAiConsent } from "../../controllers/AI/ai.js";

const router = express.Router();

router.get("/status", protect, getAiStatus);
router.post("/consent", protect, setAiConsent);

export default router;