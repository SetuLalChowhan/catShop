import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError.js";

const handleCastError = (err: mongoose.Error.CastError) =>
  new AppError(`Invalid value for ${err.path}: ${err.value}`, 400);

const handleValidationError = (err: mongoose.Error.ValidationError) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(`Validation failed: ${messages.join(". ")}`, 400);
};

const handleDuplicateKey = () =>
  new AppError("This record already exists. Please use a different value.", 400);

const handleJWTError = () => new AppError("Invalid session token. Please sign in again.", 401);

const handleJWTExpired = () => new AppError("Your session has expired. Please sign in again.", 401);

const sendErrorDev = (err: AppError, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, res: Response) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({ status: err.status, message: err.message });
  } else {
    console.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong on the server.",
    });
  }
};

/**
 * Normalise any thrown value into an AppError with the correct status code.
 * Known client errors (invalid ObjectId, validation failures, duplicate
 * keys, bad/expired JWT) map to friendly 4xx messages instead of leaking
 * internal details as a 500.
 */
function normalizeError(err: unknown): AppError {
  if (err instanceof AppError) return err;
  if (err instanceof mongoose.Error.CastError) return handleCastError(err);
  if (err instanceof mongoose.Error.ValidationError) return handleValidationError(err);
  if ((err as { code?: number } | null)?.code === 11000) return handleDuplicateKey();
  if (err instanceof Error && err.name === "JsonWebTokenError") return handleJWTError();
  if (err instanceof Error && err.name === "TokenExpiredError") return handleJWTExpired();
  if (err instanceof Error) return new AppError(err.message, 500);
  return new AppError("Unknown error", 500);
}

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const mapped = normalizeError(err);

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(mapped, res);
    return;
  }

  sendErrorProd(mapped, res);
};

export default errorMiddleware;
