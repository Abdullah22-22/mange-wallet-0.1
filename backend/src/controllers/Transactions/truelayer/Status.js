import { getToken } from "../../../modules/Transactions/truelayer/tokenStore.js";

export const getTLStatus = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        ok: false,
        message: "Unauthorized",
      });
    }

    const token = await getToken(userId);

    const connected = !!(token?.accessToken && token?.refreshToken);

    return res.json({
      ok: true,
      connected,
      expiresAt: token?.expiresAt || null,
      provider: "truelayer",
    });
  } catch (err) {
    next(err);
  }
};