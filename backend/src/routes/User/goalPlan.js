import { Router } from "express";
import { protect } from "../../Middleware/authe.js";
import { createGoalPlan, getMyGoalPlan, updateMyGoalPlan } from "../../controllers/User/goalPlan.js";

const router = Router();

router.get("/me", protect, getMyGoalPlan);
router.post("/", protect, createGoalPlan);
router.patch("/me", protect, updateMyGoalPlan);

export default router;