import mongoose from "mongoose";

const TLSelectedAccountSchema = new mongoose.Schema(
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
    },
  },
  { timestamps: true }
);

TLSelectedAccountSchema.index(
  { userId: 1, provider: 1 },
  { unique: true }
);

export default mongoose.models.TLSelectedAccount ||
  mongoose.model("TLSelectedAccount", TLSelectedAccountSchema);