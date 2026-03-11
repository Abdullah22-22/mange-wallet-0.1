import mongoose from "mongoose";

const GoalPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    monthlyIncome: {
      type: Number,
      required: true,
      min: 0,
    },

    fixedExpensesMonthly: {
      type: Number,
      default: 0,
      min: 0,
    },

    targetSavingsMonthly: {
      type: Number,
      required: true,
      min: 0,
    },

    targetDate: {
      type: Date,
      required: true,
    },

    payday: {
      type: Number,
      min: 1,
      max: 31,
      default: 1,
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },

    strictness: {
      type: String,
      enum: ["flexible", "balanced", "strict"],
      default: "balanced",
    },

    priority: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },

    categoriesToReduce: {
      type: [String],
      required: true,
    },

    reason: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["active", "paused", "archived"],
      default: "active",
    },

  },
  { timestamps: true }
);

const GoalPlan = mongoose.model("GoalPlan", GoalPlanSchema);
export default GoalPlan;