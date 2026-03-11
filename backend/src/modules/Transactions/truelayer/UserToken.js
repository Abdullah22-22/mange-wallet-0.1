import mongoose from "mongoose";
import crypto from "crypto";

/*
  ==================================
    Encryption Helpers (AES-256-GCM)
  ==================================
*/

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // recommended for GCM

// Build a 32-byte key from env secret
function getKey() {
  if (!process.env.TOKEN_ENCRYPTION_SECRET) {
    throw new Error("TOKEN_ENCRYPTION_SECRET is missing in env");
  }

  return crypto
    .createHash("sha256")
    .update(process.env.TOKEN_ENCRYPTION_SECRET)
    .digest(); // 32 bytes
}

// Encrypt plaintext -> base64(iv + tag + ciphertext)
function encrypt(text) {
  if (!text) return text;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

function decrypt(encryptedText) {
  if (!encryptedText) return encryptedText;

  try {
    const buffer = Buffer.from(encryptedText, "base64");

    // iv(12) + tag(16) + ciphertext(>=1)
    if (buffer.length < 12 + 16 + 1) return encryptedText;

    const iv = buffer.slice(0, IV_LENGTH);
    const tag = buffer.slice(IV_LENGTH, IV_LENGTH + 16);
    const encrypted = buffer.slice(IV_LENGTH + 16);

    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString("utf8");
  } catch {
    return encryptedText;
  }
}


const UserTokenSchema = new mongoose.Schema(
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
      index: true,
    },

    connectionId: {
      type: String,
      default: null,
      index: true,
    },

    accessToken: {
      type: String,
      required: true,
      select: true,
    },

    refreshToken: {
      type: String,
      required: true,
      select: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    scope: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

/*
  Unique token per (user + provider + connectionId)
*/
UserTokenSchema.index(
  { userId: 1, provider: 1, connectionId: 1 },
  { unique: true }
);

/*
  Encrypt tokens before saving
*/
UserTokenSchema.pre("save", function (next) {
  if (this.isModified("accessToken")) {
    this.accessToken = encrypt(this.accessToken);
  }

  if (this.isModified("refreshToken")) {
    this.refreshToken = encrypt(this.refreshToken);
  }

  next();
});


function decryptTokens(doc) {
  if (!doc) return;

  if (doc.accessToken) doc.accessToken = decrypt(doc.accessToken);
  if (doc.refreshToken) doc.refreshToken = decrypt(doc.refreshToken);
}

UserTokenSchema.post("init", function (doc) {
  decryptTokens(doc);
});

UserTokenSchema.post("findOne", function (doc) {
  decryptTokens(doc);
});

UserTokenSchema.post("find", function (docs) {
  if (!Array.isArray(docs)) return;
  docs.forEach(decryptTokens);
});

export default mongoose.model("UserToken", UserTokenSchema);