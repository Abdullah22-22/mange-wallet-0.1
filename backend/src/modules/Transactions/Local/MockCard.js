import mongoose from "mongoose";

const MockCardSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    accountId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    cardId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    brand: {
      type: String,
      enum: ["visa", "mastercard"],
      default: "visa",
    },

    last4: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 4,
    },

    expiryMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    expiryYear: {
      type: Number,
      required: true,
      min: 2024,
      max: 2100,
    },

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("MockCard", MockCardSchema);
