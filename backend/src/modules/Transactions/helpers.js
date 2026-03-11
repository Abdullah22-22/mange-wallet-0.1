import axios from "axios";
import MockCard from "../Transactions/Local/MockCard.js";
import MockTransaction from "../Transactions/Local/MockTransaction.js";
import { getToken, saveToken, clearToken } from "../Transactions/truelayer/tokenStore.js";

/* ==================================
   ENV + Helpers
================================== */

const env = () => ({
  AUTH_BASE: process.env.TL_AUTH_BASE?.trim(),
  DATA_BASE: process.env.TL_DATA_BASE?.trim(),
  CLIENT_ID: process.env.TL_CLIENT_ID?.trim(),
  CLIENT_SECRET: process.env.TL_CLIENT_SECRET?.trim(),
  REDIRECT_URI: process.env.TL_REDIRECT_URI?.trim(),
  SCOPES: (process.env.TL_SCOPES || "info accounts balance transactions offline_access").trim(),
});

const toError = (err, label) => {
  const e = new Error(label);
  e.status = err?.response?.status || 500;
  e.data = err?.response?.data;
  return e;
};

const expiresAtFrom = (expiresInSec) =>
  new Date(Date.now() + Number(expiresInSec || 0) * 1000);

const dayRange = (daysAgo = 0) => {
  const start = new Date();
  start.setDate(start.getDate() - daysAgo);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

const randomDateBetween = (start, end) =>
  new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

/* ==================================
   TRUE LAYER
================================== */

// Internal: call token endpoint (code exchange or refresh)
async function tlPostToken(bodyParams, label) {
  const { AUTH_BASE } = env();

  try {
    const { data } = await axios.post(`${AUTH_BASE}/connect/token`, bodyParams, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return data;
  } catch (err) {
    throw toError(err, label);
  }
}

// Exchange authorization code -> tokens
export async function exchangeCodeForToken(code) {
  const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = env();

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  return tlPostToken(body, "exchangeCodeForToken failed");
}

// Refresh access token using refresh_token
export async function refreshAccessToken(refreshToken) {
  const { CLIENT_ID, CLIENT_SECRET } = env();

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  return tlPostToken(body, "refreshAccessToken failed");
}

// Get a valid access token for the user (auto-refresh if needed)
export async function getValidAccessToken(userId) {
  const token = await getToken(userId);

  if (!token) {
    const e = new Error("Bank not connected");
    e.status = 401;
    throw e;
  }

  // 30s safety window
  const stillValid = new Date(token.expiresAt) > new Date(Date.now() + 30_000);
  if (stillValid) return token.accessToken;

  try {
    const fresh = await refreshAccessToken(token.refreshToken);

    const updated = {
      accessToken: fresh.access_token,
      refreshToken: fresh.refresh_token || token.refreshToken,
      expiresAt: expiresAtFrom(fresh.expires_in),
      scope: fresh.scope,
    };

    await saveToken(userId, updated);
    return updated.accessToken;
  } catch (err) {
    // If refresh token is invalid -> clear saved token and force reconnect
    if (err?.data?.error === "invalid_grant") {
      await clearToken(userId);
      const e = new Error("Re-connect required");
      e.status = 401;
      throw e;
    }
    throw err;
  }
}

// GET data endpoint with bearer token
export async function tlGet(path, accessToken, params = {}) {
  const { DATA_BASE } = env();

  try {
    const { data } = await axios.get(`${DATA_BASE}${path}`, {
      params,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return data;
  } catch (err) {
    throw toError(err, `tlGet failed: ${path}`);
  }
}

/* ==================================
   MOCK HELPERS
================================== */

// Get accountId linked to user (mock card)
export async function resolveAccountId(userId) {
  const card = await MockCard.findOne({ userId }).lean();
  return card?.accountId || null;
}

// Simple card number check (16 digits)
export function isValidCardNumber(num) {
  return /^\d{16}$/.test(String(num || ""));
}

/* ==================================
   MOCK DATA GUARANTEES
================================== */

// Ensure at least 2 tx per day
export async function ensureTwoTransactionsPerDay({
  userId,
  accountId,
  days = 90,
  currency = "EUR",
}) {
  for (let i = 0; i < days; i++) {
    const { start, end } = dayRange(i);

    const count = await MockTransaction.countDocuments({
      userId,
      accountId,
      occurredAt: { $gte: start, $lt: end },
    });

    const missing = 2 - count;
    if (missing <= 0) continue;

    const txs = Array.from({ length: missing }).map(() => ({
      userId,
      accountId,
      amount: Number((Math.random() * 50 + 5).toFixed(2)),
      currency,
      direction: "OUT",
      merchantName: "Auto Daily Mock",
      description: "Guaranteed daily activity",
      category: "food",
      necessity: "optional",
      occurredAt: randomDateBetween(start, end),
      tags: [],
      source: "mock",
    }));

    await MockTransaction.insertMany(txs);
  }
}

// Ensure min total OUT spending per day
export async function ensureMinDailySpend({
  userId,
  accountId,
  days = 90,
  minTotal = 100,
  currency = "EUR",
}) {
  for (let i = 0; i < days; i++) {
    const { start, end } = dayRange(i);

    const todays = await MockTransaction.find({
      userId,
      accountId,
      direction: "OUT",
      occurredAt: { $gte: start, $lt: end },
    })
      .select("amount")
      .lean();

    const total = todays.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const missing = Number((minTotal - total).toFixed(2));

    if (missing <= 0) continue;

    await MockTransaction.create({
      userId,
      accountId,
      amount: missing,
      currency,
      direction: "OUT",
      merchantName: "Auto Daily Min Spend",
      description: `Auto top-up to reach €${minTotal}/day`,
      category: "food",
      necessity: "optional",
      occurredAt: randomDateBetween(start, end),
      tags: [],
      source: "mock",
    });
  }
}