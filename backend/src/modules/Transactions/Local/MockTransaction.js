import mongoose from "mongoose";

const MockTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    accountId: {
      type: String,
      required: true,
      index: true,
    },

    merchantName: {
      type: String,
      default: "Unknown Merchant",
      trim: true,
      maxlength: 120,
    },

    direction: {
      type: String,
      enum: ["IN", "OUT"],
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "EUR",
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },

    occurredAt: {
      type: Date,
      required: true,
      index: true,
    },

    category: {
      type: String,
      default: "other",
      trim: true,
      index: true,
    },

    description: {
      type: String,
      default: "",
      maxlength: 500,
    },

 necessity: {
  type: String,
  enum: ["essential", "non-essential", "optional", "unknown"],
  default: "unknown",
  index: true,
},

    tags: {
      type: [String],
      default: [],
    },

    source: {
      type: String,
      enum: ["mock", "truelayer"],
      default: "mock",
      index: true,
    },
  },
  { timestamps: true }
);

MockTransactionSchema.index({ userId: 1, occurredAt: -1 });

export default mongoose.model("MockTransaction", MockTransactionSchema);