/*
   ========================
     Unified Transactions Logic
   ========================
   - Normalizes transactions from different sources
   - Produces a single unified transaction shape
*/

/**
 * Unified Transaction Types
 * @typedef {"truelayer"|"mock"} TxSource
 * @typedef {"OUT"|"IN"} TxDirection
 * @typedef {"food"|"transport"|"entertainment"|"subscriptions"} TxCategory
 * @typedef {"mandatory"|"optional"|"unnecessary"|"unknown"} TxNecessity
 */

/*
   ========================
     Amount Normalization
   ========================
   - Supports numbers, strings, and nested amount objects
*/
function normalizeAmount(tx) {
  if (typeof tx.amount === "number") return tx.amount;
  if (typeof tx.amount === "string") return Number(tx.amount);

  if (tx.amount && typeof tx.amount === "object") {
    if (typeof tx.amount.amount === "number") return tx.amount.amount;
    if (typeof tx.amount.value === "number") return tx.amount.value;

    // (optional safety if nested values are strings)
    if (typeof tx.amount.amount === "string") return Number(tx.amount.amount);
    if (typeof tx.amount.value === "string") return Number(tx.amount.value);
  }

  return 0;
}

/*
   ========================
     Date Normalization
   ========================
   - Tries multiple known timestamp fields
*/
function normalizeDate(tx) {
  return (
    tx.timestamp ||
    tx.transaction_timestamp ||
    tx.booking_date ||
    tx.executed ||
    tx.created_at ||
    new Date().toISOString()
  );
}

/*
   ========================
     Text Normalization
   ========================
   - Extracts merchant name and description
*/
function normalizeText(tx) {
  const merchantName =
    tx.merchant_name ||
    tx.merchantName ||
    tx.counterparty?.name ||
    tx.provider?.display_name;

  const description =
    tx.description ||
    tx.transaction_description ||
    tx.reference ||
    tx.remittance_information;

  return { merchantName, description };
}

/*
   ========================
     Direction Resolution
   ========================
   - Determines IN / OUT from tx fields or amount sign
*/
function directionFromAmount(rawAmount, tx) {
  const d = tx.direction || tx.transaction_type || tx.type;

  if (d === "OUT" || d === "DEBIT") return "OUT";
  if (d === "IN" || d === "CREDIT") return "IN";

  return rawAmount < 0 ? "OUT" : "IN";
}

/*
   ========================
     Amount Normalization
   ========================
   - Always returns a positive number
*/
function absAmount(rawAmount) {
  return Math.abs(rawAmount);
}

/*
   ========================
     Category Detection
   ========================
   - Infers category from merchant name or description
*/
function categorize({ merchantName = "", description = "" }) {
  const t = `${merchantName} ${description}`.toLowerCase();

  // ===== Subscriptions / Bills =====
  if (
    t.includes("prime") ||
    t.includes("netflix") ||
    t.includes("spotify") ||
    t.includes("mobile") ||
    t.includes("talktalk") ||
    t.includes("ee") ||
    t.includes("t-mobile") ||
    t.includes("subscription") ||
    t.includes("insurance") ||
    t.includes("axa") ||
    t.includes("energy") ||
    t.includes("electric") ||
    t.includes("water") ||
    t.includes("ovo") ||
    t.includes("e.on") ||
    t.includes("edf") ||
    t.includes("tax") ||
    t.includes("dvla") ||
    t.includes("licence") ||
    t.includes("membership")
  ) {
    return "subscriptions";
  }

  // ===== Transport =====
  if (
    t.includes("uber") ||
    t.includes("bolt") ||
    t.includes("taxi") ||
    t.includes("metro") ||
    t.includes("bus") ||
    t.includes("petrol") ||
    t.includes("circle k") ||
    t.includes("shell")
  ) {
    return "transport";
  }

  // ===== Food / Supermarket =====
  if (
    t.includes("tesco") ||
    t.includes("asda") ||
    t.includes("lidl") ||
    t.includes("spar") ||
    t.includes("morrisons") ||
    t.includes("sainsbury") ||
    t.includes("dunnes") ||
    t.includes("supervalue") ||
    t.includes("mcdonald") ||
    t.includes("restaurant") ||
    t.includes("cafe") ||
    t.includes("grocery") ||
    t.includes("market")
  ) {
    return "food";
  }

  // ===== Entertainment / Shopping =====
  if (
    t.includes("amazon") ||
    t.includes("paypal") ||
    t.includes("ebay") ||
    t.includes("gaming") ||
    t.includes("bet") ||
    t.includes("bingo") ||
    t.includes("games") ||
    t.includes("cinema") ||
    t.includes("movie") ||
    t.includes("club") ||
    t.includes("butlins") ||
    t.includes("holiday")
  ) {
    return "entertainment";
  }


  return "food";
}
/*
   ========================
     Necessity Mapping
   ========================
   - Maps category to necessity level
*/
function necessityFromCategory(cat) {
  if (cat === "food" || cat === "transport") return "optional";
  if (cat === "subscriptions") return "unnecessary";
}

/*
   ========================
     TrueLayer → Unified
   ========================
   - Maps a TrueLayer transaction to unified shape
*/
export function mapTrueLayerTxToUnified(tx, { userId, accountId }) {
  const rawAmount = normalizeAmount(tx);
  const occurredAtRaw = normalizeDate(tx);
  const { merchantName, description } = normalizeText(tx);
  const direction = directionFromAmount(rawAmount, tx);
  const amount = absAmount(rawAmount);
  const category = categorize({ merchantName, description });
  const necessity = necessityFromCategory(category);

  return {
    id: `tl_${tx.transaction_id || tx.id || `${accountId}_${occurredAtRaw}_${amount}`}`,
    source: "truelayer",
    userId,
    accountId,
    occurredAt: new Date(occurredAtRaw).toISOString(),
    currency: tx.currency || "EUR",
    amount: Number(amount) || 0,
    direction,
    merchantName,
    description,


    category,
    necessity,

    tags: [],
    raw: undefined,
  };
}

/*
   ========================
     Mock → Unified
   ========================
   - Maps a mock transaction to unified shape
*/
export function mapMockTxToUnified(tx, { userId }) {
  if (!tx) return null;

  return {
    id: `mk_${tx._id || tx.id}`,
    source: tx.source || "mock",
    userId,
    accountId: tx.accountId,
    occurredAt: new Date(tx.occurredAt || Date.now()).toISOString(),
    currency: tx.currency || "EUR",
    amount: Number(tx.amount) || 0,
    direction: tx.direction || "OUT",

    merchantName: tx.merchantName || "",
    description: tx.description || "",

    category: tx.category || "",
    necessity: tx.necessity || "unknown",
    tags: tx.tags || [],
    raw: undefined,
  };
}
