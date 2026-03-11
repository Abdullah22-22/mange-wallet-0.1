import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import connectDB from "./db/connectDB.js";
import trueLayerAuthRoutes from "./routes/Transactions/truelayer/TrueLayerAuth.js"
import spendingRoutes from "./routes/Reports/Spending.js";
import bankAccountRoutes from "./routes/Transactions/Local/userBankAccount.js"
import userRouter from "./routes/Auth/userRouter.js";
import aiRouter from "./routes/AI/ai.js";
import { errorHandler } from "./Middleware/errorHandler.js";
import cookieParser from "cookie-parser";
import goalPlanRoutes from "./routes/User/goalPlan.js"
dotenv.config();
const PORT = process.env.PORT || 4001;
const app = express();

// Rate Limiter
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later",
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(limiter);


app.use("/api/tl", trueLayerAuthRoutes);
app.use("/api/reports", spendingRoutes);
app.use("/api/bank", bankAccountRoutes);
app.use("/api/users", userRouter);
app.use("/api/users/ai", aiRouter);
app.use("/api/goal-plans", goalPlanRoutes);

app.use(errorHandler);
app.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`Server running on http://localhost:${PORT}`);
  } catch (error) {
    console.error("Failed to start server:", error.message);
  }
});
