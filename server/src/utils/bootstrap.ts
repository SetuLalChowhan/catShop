import type { Express } from "express";
import { connectDB, db } from "../config/db.js";
import { configureCloudinary } from "../config/cloudinary.js";
import { configureDNS } from "../config/dns.js";
import { runSeeds } from "../seeds/index.js";

const PORT = process.env.PORT || 5000;

export async function startApp(app: Express) {
  try {
    // 0. DNS override (must run before any hostname resolution)
    configureDNS();

    // 1. MongoDB connection
    await connectDB();

    // 2. Cloudinary SDK
    configureCloudinary();

    // 3. Seed default admin + content
    await runSeeds();

    // 4. Start listening
    const server = app.listen(PORT, () => {
      console.log(
        `Server running → http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode 🚀`,
      );
    });

    // 5. Graceful shutdown
    const handleShutdown = async (signal: string) => {
      console.log(`${signal} received. Closing HTTP server gracefully...`);
      server.close(async () => {
        await db.close();
        console.log("DB connection closed. Process terminated.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => handleShutdown("SIGTERM"));
    process.on("SIGINT", () => handleShutdown("SIGINT"));

    return server;
  } catch (error) {
    console.error("Failed to initialize server:", error);
    process.exit(1);
  }
}
