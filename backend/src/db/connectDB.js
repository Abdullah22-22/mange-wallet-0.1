import mongoose from "mongoose";

const connectDB = async (options = {}) => {
  const mongoUrl = process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error("MONGO_URL is missing in .env file");
  }

  try {
    await mongoose.connect(mongoUrl, options);
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
