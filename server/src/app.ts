import express from "express";
import cookieParser from "cookie-parser";
import corsMiddleware from "./middlewares/cors.middleware.js";
import apiRouter from "./routes/index.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { AppError } from "./utils/AppError.js";

const app = express();

// ── Core Middleware ───────────────────────────────────────────────────────────
app.use(corsMiddleware);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Cat booking API is running" });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api", apiRouter);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// ── Global Error Handler (must be last) ───────────────────────────────────────
app.use(errorMiddleware);

export { app };
export default app;
