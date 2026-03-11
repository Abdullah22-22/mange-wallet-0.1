import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    const token = req.cookies?.AccessToken;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!process.env.jwt) {
      return res.status(500).json({ message: "JWT secret not configured" });
    }

    const decoded = jwt.verify(token, process.env.jwt);

    if (!decoded?.sub) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = { id: decoded.sub };
    req.userId = decoded.sub;
    req.authType = decoded.authType || "app";
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};  