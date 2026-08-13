import cors from "cors";

const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow same-origin and explicitly configured clients.
    if (!origin || origin === clientUrl || origin.startsWith("http://localhost:")) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

export default corsMiddleware;
