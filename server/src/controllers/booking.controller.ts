import type { Response, NextFunction } from "express";
import mongoose from "mongoose";
import BookingModel, { type BookingStatus } from "../models/Booking.model.js";
import CatModel from "../models/Cat.model.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import type { AuthenticatedRequest } from "../types/index.js";

/** POST /api/bookings — public booking submission. */
export const createBooking = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const body = req.body as {
      customerName: string;
      email: string;
      phone: string;
      cat: string;
      preferredDate?: string | null;
      message?: string;
    };

    let catId: string | null = null;
    if (body.cat) {
      if (!mongoose.isValidObjectId(body.cat)) {
        return next(new AppError("Please select a valid cat", 400));
      }
      const cat = await CatModel.findById(body.cat);
      if (!cat || cat.status !== "active") {
        return next(new AppError("The selected cat is no longer available", 400));
      }
      if (cat.availability === "sold") {
        return next(new AppError("Sorry, this cat has already found their home", 400));
      }
      catId = body.cat;
    }

    const booking = await BookingModel.create({
      customerName: body.customerName,
      email: body.email,
      phone: body.phone,
      cat: catId,
      preferredDate: body.preferredDate ? new Date(body.preferredDate) : null,
      message: body.message || "",
      status: "pending",
    });

    res.status(201).json({
      status: "success",
      message: "Booking request received — we'll be in touch shortly.",
      data: { booking },
    });
  },
);

// ── Admin ─────────────────────────────────────────────────────────────────────

/** GET /api/admin/bookings — search, filter by status, paginated. */
export const getBookings = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { search, status, page = "1", limit = "10" } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    if (status && status !== "all") filter.status = status;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      BookingModel.find(filter)
        .populate("cat", "name slug breed images availability")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      BookingModel.countDocuments(filter),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        bookings,
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      },
    });
  },
);

/** GET /api/admin/bookings/:id */
export const getBooking = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const booking = await BookingModel.findById(req.params.id).populate(
      "cat",
      "name slug breed images availability",
    );
    if (!booking) return next(new AppError("Booking not found", 404));

    res.status(200).json({ status: "success", data: { booking } });
  },
);

/** PATCH /api/admin/bookings/:id — update status only. */
export const updateBooking = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { status } = req.body as { status: BookingStatus };

    const booking = await BookingModel.findById(req.params.id);
    if (!booking) return next(new AppError("Booking not found", 404));

    booking.status = status;
    await booking.save();

    res.status(200).json({
      status: "success",
      message: "Booking status updated",
      data: { booking },
    });
  },
);

/** DELETE /api/admin/bookings/:id */
export const deleteBooking = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) return next(new AppError("Booking not found", 404));

    await booking.deleteOne();

    res.status(200).json({
      status: "success",
      message: "Booking deleted",
    });
  },
);
