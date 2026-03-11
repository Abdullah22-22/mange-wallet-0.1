import axios from "axios";
import { getToken, saveToken, clearToken } from "../modules/Transactions/truelayer/tokenStore.js";

/*
  ========================
    Env Helper (minimal)
  ========================
*/
function getEnv() {
  return {
    AUTH_BASE: process.env.TL_AUTH_BASE?.trim(),
    DATA_BASE: process.env.TL_DATA_BASE?.trim(),
    CLIENT_ID: process.env.TL_CLIENT_ID?.trim(),
    CLIENT_SECRET: process.env.TL_CLIENT_SECRET?.trim(),
  };
}

/*
  ========================
    Axios Error Normalizer
  ========================
*/
function axiosErrorToPayload(err) {
  return {
    message: err?.message || "Request failed",
    status: err?.response?.status ?? 500,
    data: err?.response?.data,
  };
}

/*
  ========================
    Token Expiry Calculator
  ========================
*/
const calcExpiresAt = (expiresIn) => new Date(Date.now() + Number(expiresIn || 0) * 1000);

/*
  ========================
    Refresh Access Token
  ========================
*/
export async function refreshAccessToken(refreshToken) {
  const { AUTH_BASE, CLIENT_ID, CLIENT_SECRET } = getEnv();

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: refreshToken,
  });

  try {
    const { data } = await axios.post(`${AUTH_BASE}/connect/token`, body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return data;
  } catch (err) {
    const payload = axiosErrorToPayload(err);
    throw Object.assign(new Error("refreshAccessToken failed"), payload);
  }
}

/*
  ========================
    Get Valid Access Token
  ========================
  - Reads token from Mongo
  - Refreshes if expires in <= 30 seconds
  - invalid_grant => clears token => 401 (re-connect required)
*/
export async function getValidAccessToken(userId) {
  const token = await getToken(userId);

  if (!token) {
    const err = new Error("Bank not connected");
    err.status = 401;
    throw err;
  }

  const stillValid = new Date(token.expiresAt) > new Date(Date.now() + 30_000);
  if (stillValid) return token.accessToken;

  try {
    const fresh = await refreshAccessToken(token.refreshToken);

    const updated = {
      accessToken: fresh.access_token,
      refreshToken: fresh.refresh_token || token.refreshToken,
      expiresAt: calcExpiresAt(fresh.expires_in),
      scope: fresh.scope,
    };

    await saveToken(userId, updated);
    return updated.accessToken;
  } catch (err) {
    if (err?.data?.error === "invalid_grant") {
      await clearToken(userId);
      const e = new Error("Re-connect required");
      e.status = 401;
      throw e;
    }
    throw err;
  }
}

/*
  ========================
    Authorized GET Request
  ========================
*/
export async function tlGet(path, accessToken, params = {}) {
  const { DATA_BASE } = getEnv();

  try {
    return await axios.get(`${DATA_BASE}${path}`, {
      params,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch (err) {
    const payload = axiosErrorToPayload(err);
    throw Object.assign(new Error(`tlGet failed: ${path}`), payload);
  }
}