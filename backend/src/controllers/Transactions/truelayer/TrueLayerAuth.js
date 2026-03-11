import crypto from "crypto";
import TLState from "../../../modules/Transactions/truelayer/TLState.js";
import { saveToken } from "../../../modules/Transactions/truelayer/tokenStore.js";
import { exchangeCodeForToken } from "../../../modules/Transactions/helpers.js";

/*
  ==========================
    START (Protected)
  ==========================
*/
export const start = async (req, res,next) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ ok: false, message: "Unauthorized" });

    const AUTH_BASE = process.env.TL_AUTH_BASE?.trim();
    const CLIENT_ID = process.env.TL_CLIENT_ID?.trim();
    const REDIRECT_URI = process.env.TL_REDIRECT_URI?.trim();
    const SCOPES = (process.env.TL_SCOPES || "info accounts balance transactions offline_access").trim();
    const PROVIDERS = (process.env.TL_PROVIDERS || "uk-cs-mock").trim();

    if (!AUTH_BASE || !CLIENT_ID || !REDIRECT_URI) {
      return res.status(500).json({ ok: false, message: "Missing TL env vars" });
    }

    const state = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await TLState.create({ state, expiresAt, userId });

    const url = new URL(AUTH_BASE);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", CLIENT_ID);
    url.searchParams.set("redirect_uri", REDIRECT_URI);
    url.searchParams.set("scope", SCOPES);
    url.searchParams.set("state", state);

    if (PROVIDERS) url.searchParams.set("providers", PROVIDERS);

    return res.json({ ok: true, authUrl: url.toString() });
  } catch (err) {
     next(err);
  }
};
/*
  ==========================
    CALLBACK (Public)
  ==========================
*/
export const callback = async (req, res,next) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({ ok: false, message: "Missing code or state" });
    }

    const st = await TLState.findOne({ state });

    if (!st || new Date(st.expiresAt) < new Date()) {
      return res.status(400).json({ ok: false, message: "Invalid state" });
    }

    const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

    if (st.usedAt) {
      return res.redirect(`${FRONTEND_URL}/dashboard?tl=already_connected`);
    }

    st.usedAt = new Date();
    await st.save();

    const tokenData = await exchangeCodeForToken(code);

    await saveToken(st.userId, {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: new Date(Date.now() + Number(tokenData.expires_in || 0) * 1000),
      scope: tokenData.scope,
    });

    return res.redirect(`${FRONTEND_URL}/dashboard?tl=connected`);
  } catch (err) {
         next(err);

  }
};
