import "dotenv/config";
import { connectDB, db } from "../config/db.js";
import { configureCloudinary } from "../config/cloudinary.js";
import { runSeeds } from "./index.js";

// Manual seed runner: npm run seed
async function main() {
  await connectDB();
  configureCloudinary();
  await runSeeds();
  await db.close();
  console.log("Seeding complete 🌱");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
