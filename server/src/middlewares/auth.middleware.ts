import type { Response, NextFunction } from "express";
import AdminModel from "../models/Admin.model.js";
import { verifyToken, COOKIE_NAME } from "../utils/auth.util.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import type { AuthenticatedRequest } from "../types/index.js";

/**
 * Protect admin routes. Accepts the JWT from the HTTP-only cookie
 * (primary) or an `Authorization: Bearer <token>` header (fallback).
 */
export const protect = catchAsync(
  async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.cookies?.[COOKIE_NAME]) {
      token = req.cookies[COOKIE_NAME];
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError("You are not logged in. Please sign in to continue.", 401),
      );
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return next(
        new AppError("Your session has expired. Please sign in again.", 401),
      );
    }

    const admin = await AdminModel.findById(decoded.adminId);
    if (!admin) {
      return next(
        new AppError("The account for this session no longer exists.", 401),
      );
    }

    req.admin = admin;
    next();
  },
);

/** Restrict a route to specific admin roles. */
export const restrictTo =
  (...roles: string[]) =>
  (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }
    next();
  };
