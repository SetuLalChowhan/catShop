import type { Response, NextFunction } from "express";
import AdminModel from "../models/Admin.model.js";
import {
  comparePassword,
  hashPassword,
  signToken,
  COOKIE_NAME,
  cookieOptions,
} from "../utils/auth.util.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import type { AuthenticatedRequest } from "../types/index.js";

/** POST /api/auth/login */
export const login = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { email, password } = req.body as { email: string; password: string };

    const admin = await AdminModel.findOne({ email }).select("+password");
    if (!admin || !(await comparePassword(password, admin.password))) {
      return next(new AppError("Invalid email or password", 401));
    }

    const token = signToken({ adminId: admin.id, role: admin.role });
    res.cookie(COOKIE_NAME, token, cookieOptions());

    res.status(200).json({
      status: "success",
      message: "Welcome back!",
      data: { admin, token },
      token,
    });
  },
);

/** POST /api/auth/logout */
export const logout = catchAsync(async (_req: AuthenticatedRequest, res: Response) => {
  res.clearCookie(COOKIE_NAME, cookieOptions());
  res.status(200).json({ status: "success", message: "Signed out successfully" });
});

/** GET /api/auth/me */
export const me = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return next(new AppError("Not authenticated", 401));
    }
    res.status(200).json({ status: "success", data: { admin: req.admin } });
  },
);

/** PATCH /api/auth/profile — update admin credentials & password */
export const updateProfile = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return next(new AppError("Not authenticated", 401));
    }

    const { name, email, currentPassword, newPassword } = req.body as {
      name?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    };

    const admin = await AdminModel.findById(req.admin._id).select("+password");
    if (!admin) {
      return next(new AppError("Admin account not found", 404));
    }

    if (name) admin.name = name;

    if (email && email.toLowerCase() !== admin.email) {
      const existing = await AdminModel.findOne({ email: email.toLowerCase() });
      if (existing) {
        return next(new AppError("This email address is already in use", 400));
      }
      admin.email = email.toLowerCase();
    }

    if (newPassword) {
      if (!currentPassword) {
        return next(new AppError("Please enter your current password to set a new password", 400));
      }
      const isMatch = await comparePassword(currentPassword, admin.password);
      if (!isMatch) {
        return next(new AppError("Current password is incorrect", 400));
      }
      admin.password = await hashPassword(newPassword);
    }

    await admin.save();

    res.status(200).json({
      status: "success",
      message: "Admin credentials updated successfully",
      data: { admin },
    });
  },
);
