
import { Router } from "express";
import { getSpendingDashboard } from "../../controllers/Reports/LocalSpending.js";
import { getTrueLayerSpendingDashboard } from "../../controllers/Reports/TrueLyersSpending.js";
import { protect } from "../../Middleware/authe.js";
const router = Router();

router.get("/spending", protect, getSpendingDashboard);
router.get("/truelayer/spending", protect, getTrueLayerSpendingDashboard);
export default router;



