import MockTransaction from "../../modules/Transactions/Local/MockTransaction.js";
import MockCard from "../../modules/Transactions/Local/MockCard.js";
import {
  buildSpendingReport,
  buildTodaysSpending,
  buildTopExpenseCategories,
} from "../../modules/Reports/spendingReport.js";
import { mapMockTxToUnified } from "../../modules/Transactions/Transactions.logic.js";

/*
  ======================================
  Helper Function
  ======================================
*/

/**
 * Get the accountId linked to the user.
 * If no card exists, return null.
 */
async function resolveAccountId(userId) {
  const card = await MockCard.findOne({ userId }).lean();
  return card?.accountId || null;
}

/*
  ======================================
  Get Spending Dashboard (Local DB)
  ======================================
*/

/**
 * Return a full spending dashboard for the user.
 * Includes:
 * - Today summary
 * - Weekly report
 * - Monthly report
 * - Yearly report
 * - Top expense categories
 */
export async function getSpendingDashboard(req, res, next) {
  try {
    // Extract user ID from JWT payload
    // const userId = (req.user?._id || req.user?.id)?.toString();
    const userId = req.userId;

    // If no authenticated user, return 401
    if (!userId) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    // Get requested currency (default = EUR)
    const currency = (req.query?.currency || "EUR")
      .toString()
      .toUpperCase();

    // Resolve accountId linked to user
    const accountId = await resolveAccountId(userId);

    // If user has no bank card yet → return empty dashboard
    if (!accountId) {
      return res.json({
        ok: true,
        source: "local-db",
        userId,
        accountId: null,
        currency,
        report: {
          today: buildSpendingReport([], "today", currency),
          weekly: buildSpendingReport([], "week", currency),
          monthly: buildSpendingReport([], "month", currency),
          yearly: buildSpendingReport([], "year", currency),
        },
        today: buildTodaysSpending([], currency),
        top: buildTopExpenseCategories([], {
          range: "month",
          currency,
          limit: 4,
        }),
        message: "No bank card yet. Returning empty dashboard.",
      });
    }

    // 1) Fetch all transactions once (sorted by newest first)
    const docs = await MockTransaction.find({ userId, accountId })
      .sort({ occurredAt: -1 })
      .lean();

    // 2) Convert transactions to unified format
    const unified = docs
      .map((tx) => mapMockTxToUnified(tx, { userId }))
      .filter(Boolean);

    // 3) Build dashboard data

    // Today summary (total spending today)
    const todaySummary = buildTodaysSpending(unified, currency);

    // Reports for different time ranges
    const yearly = buildSpendingReport(unified, "year", currency);
    const monthly = buildSpendingReport(unified, "month", currency);
    const weekly = buildSpendingReport(unified, "week", currency);
    const todayReport = buildSpendingReport(unified, "today", currency);

    // Determine range for top categories (default = month)
    const topForRange =
      (req.query?.topRange || "month").toString().toLowerCase();

    const top = buildTopExpenseCategories(unified, {
      range:
        topForRange === "today"
          ? "today"
          : topForRange === "week"
            ? "week"
            : "month",
      currency,
      limit: 4,
    });

    // Return full dashboard response
    return res.json({
      ok: true,
      source: "local-db",
      userId,
      accountId,
      currency,
      report: {
        today: todayReport,
        weekly,
        monthly,
        yearly,
      },
      today: todaySummary,
      top,
    });
  } catch (err) {
    next(err);
  }
}
