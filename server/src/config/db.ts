import mongoose from "mongoose";

/**
 * Establish the MongoDB connection using Mongoose.
 * Connection is lazy — the server only listens once this resolves.
 */
export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is missing in .env");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log("MongoDB connection established successfully! 🔌");
}

export const db = mongoose.connection;
export default db;
