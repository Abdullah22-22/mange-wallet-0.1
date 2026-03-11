import { getValidAccessToken, tlGet } from "../../modules/Transactions/helpers.js";
import TLSelectedAccount from "../../modules/Transactions/truelayer/TLSelectedAccount.js";
import TLAccount from "../../modules/Transactions/truelayer/TLAccount.js";
import {
    buildSpendingReport,
    buildTodaysSpending,
    buildTopExpenseCategories,
} from "../../modules/Reports/spendingReport.js";
import { mapTrueLayerTxToUnified } from "../../modules/Transactions/Transactions.logic.js";


export async function getTrueLayerSpendingDashboard(req, res,next) {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                ok: false,
                message: "Unauthorized"
            });
        }
        const currency = (req.query?.currency || "EUR").toUpperCase();

        const sel = await TLSelectedAccount.findOne({
            userId,
            provider: "truelayer",
        }).lean();

        if (!sel?.accountId) {
            return res.status(400).json({
                ok: false,
                message: "No selected TrueLayer account",
            });
        }
        const accountId = sel.accountId;
        const acc = await TLAccount.findOne({
            userId,
            provider: "truelayer",
            accountId,
        }).lean();

        if (!acc) {
            return res.status(404).json({
                ok: false,
                message: "Selected TrueLayer account not found",
            });
        }
        const accessToken = await getValidAccessToken(userId);

        const fromISO = new Date(
            Date.now() - 365 * 24 * 60 * 60 * 1000
        ).toISOString();

        const toISO = new Date().toISOString();

        const qs = new URLSearchParams({
            from: fromISO,
            to: toISO,
        });

        const data = await tlGet(
            `/accounts/${accountId}/transactions?${qs.toString()}`,
            accessToken
        );
        const rawTxs = data?.results || data?.data || [];
        const unified = rawTxs
            .map((tx) => mapTrueLayerTxToUnified(tx, { userId, accountId }))
            .filter(Boolean);

        const todaySummary = buildTodaysSpending(unified, currency);

        const yearly = buildSpendingReport(unified, "year", currency);
        const monthly = buildSpendingReport(unified, "month", currency);
        const weekly = buildSpendingReport(unified, "week", currency);
        const todayReport = buildSpendingReport(unified, "today", currency);

        const topForRange =
            (req.query?.topRange || "month").toLowerCase();

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
        return res.json({
            ok: true,
            source: "truelayer",
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