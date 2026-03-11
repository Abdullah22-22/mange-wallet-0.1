import { Router } from "express";
import {
  CreatBankStatment,
  getBankStatments,
  createMockStatement,
} from "../../../controllers/Transactions/Local/userBankAccount.js";

import {
  createMockCard,
  getBankAccoun,
} from "../../../controllers/Transactions/Local/bankCard.js";

import { protect  } from "../../../Middleware/authe.js";

const router = Router();

// Statement / Transactions
router.post("/mock/statement", protect, createMockStatement); // for year
router.post("/transactions", protect, CreatBankStatment);     // ones
router.get("/transactions", protect, getBankStatments);

// Card / Account
router.post("/account", protect, createMockCard);
router.get("/account", protect, getBankAccoun);

export default router;