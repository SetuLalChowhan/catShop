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

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let error: AppError;

  if (err instanceof AppError) {
    error = err;
  } else if (err instanceof Error) {
    error = new AppError(err.message, 500);
  } else {
    error = new AppError("Unknown error", 500);
  }

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, res);
    return;
  }

  // Map known Mongoose/JWT errors to friendly messages in production.
  let mapped: AppError = error;
  if (err instanceof mongoose.Error.CastError) mapped = handleCastError(err);
  else if (err instanceof mongoose.Error.ValidationError) mapped = handleValidationError(err);
  else if ((err as { code?: number } | null)?.code === 11000) mapped = handleDuplicateKey();
  else if (error.name === "JsonWebTokenError") mapped = handleJWTError();
  else if (error.name === "TokenExpiredError") mapped = handleJWTExpired();

  sendErrorProd(mapped, res);
};

export default errorMiddleware;
