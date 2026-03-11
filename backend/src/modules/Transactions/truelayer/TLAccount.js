import mongoose from "mongoose";

const TLAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    provider: {
      type: String,
      required: true,
      enum: ["truelayer"],
      default: "truelayer",
      index: true,
    },

    accountId: {
      type: String,
      required: true,
      index: true,
    },

    displayName: { type: String, default: "" },
    accountType: { type: String, default: "" },
    currency: { type: String, default: "" },
    providerId: { type: String, default: "" },
  },
  { timestamps: true }
);

TLAccountSchema.index({ userId: 1, provider: 1, accountId: 1 }, { unique: true });

export default mongoose.models.TLAccount || mongoose.model("TLAccount", TLAccountSchema);