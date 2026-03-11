import MockTransaction from "../../../modules/Transactions/Local/MockTransaction.js";
import { mapMockTxToUnified } from "../../../modules/Transactions/Transactions.logic.js";
import { seedMockTransactions } from "../../../modules/Reports/bankStatement.js";
import {
  ensureMinDailySpend,
  ensureTwoTransactionsPerDay,
  resolveAccountId,
} from "../../../modules/Transactions/helpers.js";

/*
   ==================================
     POST /bank/mock/statement
   ==================================
*/

export async function createMockStatement(req, res, next) {
  const userId = req.userId || req.user?._id || req.user?.id;
  if (!userId) return res.status(401).json({ ok: false, message: "Unauthorized" });

  try {
    const accountId = await resolveAccountId(userId);
    if (!accountId) return res.status(400).json({ ok: false, message: "Create card first" });

    const days = Number(req.body?.days || 90);
    const currency = (req.body?.currency || "EUR").toString().toUpperCase();
    const minDailySpend = Number(req.body?.minDailySpend || 100);

    const result = await seedMockTransactions({ userId, accountId, days });

    await ensureTwoTransactionsPerDay({ userId, accountId, days, currency });
    await ensureMinDailySpend({ userId, accountId, days, minTotal: minDailySpend, currency });

    if (!result.allowed) {
      return res.status(200).json({
        ok: true,
        userId,
        accountId,
        inserted: 0,
        message: `Mock statement already existed; ensured min 2 tx/day and >=€${minDailySpend}/day`,
      });
    }

    return res.status(201).json({
      ok: true,
      userId,
      accountId,
      inserted: result.inserted,
      message: `Mock statement created; ensured min 2 tx/day and >=€${minDailySpend}/day`,
    });
  } catch (err) {
    next(err);

  }
}

/*
   ==================================
     POST /bank/transactions
   ==================================
*/
export async function CreatBankStatment(req, res,next) {
  const userId = req.userId || req.user?._id || req.user?.id;
  if (!userId) return res.status(401).json({ ok: false, message: "Unauthorized" });

  try {
    const accountId = await resolveAccountId(userId);
    if (!accountId) return res.status(400).json({ ok: false, message: "Create card first" });

    const {
      amount,
      currency = "EUR",
      merchantName = "",
      description = "",
      necessity = "unknown",
      occurredAt,
      category,
      direction = "OUT",
      tags = [],
    } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ ok: false, message: "Amount must be greater than 0" });
    }

    const tx = await MockTransaction.create({
      userId,
      accountId,
      amount: Number(amount),
      currency: currency.toUpperCase(),
      direction: direction === "IN" ? "IN" : "OUT",
      merchantName,
      description,
      category,
      necessity,
      occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
      tags,
      source: "mock",
    });

    return res.json({ ok: true, transaction: tx });
  } catch (err) {
     next(err);
  }
}

/*
   ==================================
     GET /bank/transactions
   ==================================
*/
export async function getBankStatments(req, res,next) {
  const userId = req.userId || req.user?._id || req.user?.id;
  if (!userId) return res.status(401).json({ ok: false, message: "Unauthorized" });

  try {
    const accountId = await resolveAccountId(userId);
    if (!accountId) return res.status(400).json({ ok: false, message: "Create card first" });

    const docs = await MockTransaction.find({ userId, accountId }).sort({ occurredAt: -1 }).lean();
    const unified = docs.map((tx) => mapMockTxToUnified(tx, { userId }));

    return res.json({ ok: true, userId, accountId, count: unified.length, transactions: unified });
  } catch (err) {
     next(err);
  }
}