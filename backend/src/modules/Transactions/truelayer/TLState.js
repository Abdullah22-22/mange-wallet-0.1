import mongoose from "mongoose";

const TLStateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    state: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    usedAt: {
      type: Date,
      default: null,
    },


    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

TLStateSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("TLState", TLStateSchema);