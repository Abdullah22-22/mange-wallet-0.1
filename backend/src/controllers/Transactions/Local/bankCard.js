import MockCard from "../../../modules/Transactions/Local/MockCard.js";
import { isValidCardNumber } from "../../../modules/Transactions/helpers.js";

/*
   ==================================
     POST /bank/account
   ==================================
*/
export async function createMockCard(req, res, next) {
  const userId = req.userId || req.user?._id || req.user?.id;

  if (!userId) return res.status(401).json({ ok: false, message: "Unauthorized" });

  try {
    const { cardNumber, fullName } = req.body;

    if (!isValidCardNumber(cardNumber)) {
      return res.status(400).json({ ok: false, message: "Invalid card number format" });
    }

    const exists = await MockCard.findOne({ userId });
    if (exists) {
      return res.status(400).json({ ok: false, message: "Account already exists for this user" });
    }

    const accountId = `acc_${userId}_${Date.now()}`;
    const last4 = cardNumber.slice(-4);

    const card = await MockCard.create({
      userId,
      accountId,
      cardId: `card_${Date.now()}`,
      fullName,
      last4,
      expiryMonth: 12,
      expiryYear: new Date().getFullYear() + 3,
      status: "active",
    });

    return res.status(201).json({
      ok: true,
      card: {
        accountId: card.accountId,
        cardId: card.cardId,
        fullName: card.fullName,
        cardNumberMasked: `**** **** **** ${last4}`,
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
      },
    });
  } catch (err) {
    next(err);

  }
}

/*
   ==================================
     GET /bank/account
   ==================================
*/
export async function getBankAccoun(req, res, next) {
  const userId = req.userId || req.user?._id || req.user?.id;
  if (!userId) return res.status(401).json({ ok: false, message: "Unauthorized" });

  try {
    const account = await MockCard.findOne({ userId });

    if (!account) {
      return res.status(404).json({ ok: false, message: "Bank account not found" });
    }

    return res.json({
      ok: true,
      account: {
        accountId: account.accountId,
        cardId: account.cardId,
        fullName: account.fullName,
        cardNumberMasked: `**** **** **** ${account.last4}`,
        expiryMonth: account.expiryMonth,
        expiryYear: account.expiryYear,
        status: account.status,
      },
    });
  } catch (err) {
    next(err);

  }
}