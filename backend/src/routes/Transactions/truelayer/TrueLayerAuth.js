import express from "express";
import { start, callback, } from "../../../controllers/Transactions/truelayer/TrueLayerAuth.js";
import {
    getAccounts,
    selectAccount,
    getSelectedAccount,
    getTLTransactionsSelected
} from "../../../controllers/Transactions/truelayer/Account.js";
import {getTLStatus} from "../../../controllers/Transactions/truelayer/Status.js";
import { protect } from "../../../Middleware/authe.js";

const router = express.Router();

router.get("/start", protect, start);
router.get("/callback", callback);
router.get("/accounts", protect, getAccounts);
router.post("/accounts/select", protect, selectAccount);
router.get("/accounts/selected", protect, getSelectedAccount);
router.get("/accounts/selected/transactions", protect, getTLTransactionsSelected);

router.get("/status", protect, getTLStatus)
export default router;