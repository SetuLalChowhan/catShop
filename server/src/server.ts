import "dotenv/config";

// Handle uncaught exceptions globally (registered immediately at startup)
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

import { app } from "./app.js";
import { startApp } from "./utils/bootstrap.js";

// Launch Express server lifecycle
startApp(app);

