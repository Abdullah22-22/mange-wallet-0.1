import { getValidAccessToken, tlGet } from "../../../modules/Transactions/helpers.js";
import TLAccount from "../../../modules/Transactions/truelayer/TLAccount.js";
import TLSelectedAccount from "../../../modules/Transactions/truelayer/TLSelectedAccount.js";
import { mapTrueLayerTxToUnified } from "../../../modules/Transactions/Transactions.logic.js";

export const getAccounts = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ ok: false, message: "Unauthorized" });

    const accessToken = await getValidAccessToken(userId);
    // const data = await tlGet("/accounts", accessToken);
    const data = await tlGet("/accounts", accessToken, {}, userId);

    const accounts = data?.results || data?.data || data;

    if (Array.isArray(accounts)) {
      await Promise.all(
        accounts.map((a) =>
          TLAccount.updateOne(
            { userId, provider: "truelayer", accountId: a.account_id },
            {
              $set: {
                displayName: a.display_name || "",
                accountType: a.account_type || "",
                currency: a.currency || "",
                providerId: a.provider_id || "",
              },
            },
            { upsert: true }
          )
        )
      );
    }
    return res.json({ ok: true, data });

  } catch (err) {
    next(err);

  }
};

export const selectAccount = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: "Unauthorized"
      });
    };
    const { accountId } = req.body;
    if (!accountId) {
      return res.status(401).json({
        ok: false,
        message: "Unauthorized"
      });
    };

    const acc = await TLAccount.findOne({
      userId,
      provider: "truelayer",
      accountId
    })
    if (!acc) {
      return res.status(404).json({
        ok: false,
        message: "Account not found for this user. Call GET /truelayer/accounts first.",
      });
    }
    await TLSelectedAccount.findOneAndUpdate(
      { userId },
      { $set: { provider: "truelayer", accountId } },
      { upsert: true, new: true }
    );
    return res.json({
      ok: true,
      message: "Account selected",
      accountId
    });
  } catch (err) {
    next(err);

  }
}
export const getSelectedAccount = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: "Unauthorized"
      });
    };

    const sel = await TLSelectedAccount.findOne({
      userId,
      provider: "truelayer"
    });
    if (!sel) {
      return res.json({
        ok: true,
        selected: null
      });
    }
    const acc = await TLAccount.findOne({
      userId,
      provider: "truelayer",
      accountId: sel.accountId
    });
    return res.json({
      ok: true,
      selected: acc || { accountId: sel.accountId },
    });

  } catch (err) {
    next(err);

  }
}


export const getTLTransactionsSelected = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: "Unauthorized"
      });
    }

    const sel = await TLSelectedAccount.findOne({
      userId,
      provider: "truelayer"
    }).lean();

    if (!sel?.accountId) {
      return res.status(400).json({
        ok: false,
        message: "No selected TrueLayer account. Call POST /truelayer/select-account first.",
        code: "NO_SELECTED_TL_ACCOUNT",
      });
    }
    const accountId = sel.accountId;

    const acc = await TLAccount.findOne({
      userId,
      provider: "truelayer",
      accountId
    }).lean();
    if (!acc) {
      return res.status(404).json({
        ok: false,
        message: "Selected account not found for this user. Call GET /truelayer/accounts then select again.",
        code: "SELECTED_ACCOUNT_NOT_FOUND",
      });
    }

    const { from, to, page_size, cursor } = req.query;

    const toISO = to ? new Date(to).toISOString() : new Date().toISOString();
    const fromISO = from
      ? new Date(from).toISOString()
      : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    const qs = new URLSearchParams();
    qs.set("from", fromISO);
    qs.set("to", toISO);
    if (page_size) qs.set("page_size", String(page_size));
    if (cursor) qs.set("cursor", String(cursor));

    const accessToken = await getValidAccessToken(userId);
    const data = await tlGet(
      `/accounts/${accountId}/transactions?${qs.toString()}`,
      accessToken,
      {},
      userId
    );
    const rawTxs = data?.results || data?.data || data?.transactions || [];
    const unified = Array.isArray(rawTxs)
      ? rawTxs.map((t) =>
        mapTrueLayerTxToUnified(t, { userId, accountId })
      )
      : [];
    return res.json({
      ok: true,
      userId,
      accountId,
      account: {
        displayName: acc.displayName,
        currency: acc.currency,
        accountType: acc.accountType,
        providerId: acc.providerId,
      },
      count: unified.length,
      transactions: unified,
      next_cursor: data?.next_cursor || data?.meta?.next_cursor || null,
      range: { from: fromISO, to: toISO },
    });
  } catch (err) {
    next(err);

  }
}