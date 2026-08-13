import type { Response } from "express";
import CatModel from "../models/Cat.model.js";
import BookingModel from "../models/Booking.model.js";
import WinnerModel from "../models/Winner.model.js";
import ContactModel from "../models/Contact.model.js";
import { catchAsync } from "../utils/catchAsync.js";
import type { AuthenticatedRequest } from "../types/index.js";

/** GET /api/admin/stats — real dashboard numbers. */
export const getDashboardStats = catchAsync(
  async (_req: AuthenticatedRequest, res: Response) => {
    const [
      totalCats,
      availableCats,
      reservedCats,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
      totalWinners,
      totalContacts,
      unreadContacts,
      recentBookings,
    ] = await Promise.all([
      CatModel.countDocuments(),
      CatModel.countDocuments({ availability: "available", status: "active" }),
      CatModel.countDocuments({ availability: "reserved", status: "active" }),
      BookingModel.countDocuments(),
      BookingModel.countDocuments({ status: "pending" }),
      BookingModel.countDocuments({ status: "confirmed" }),
      BookingModel.countDocuments({ status: "completed" }),
      BookingModel.countDocuments({ status: "cancelled" }),
      WinnerModel.countDocuments(),
      ContactModel.countDocuments(),
      ContactModel.countDocuments({ status: "unread" }),
      BookingModel.find()
        .populate("cat", "name slug breed images")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    res.status(200).json({
      status: "success",
      data: {
        stats: {
          totalCats,
          availableCats,
          reservedCats,
          totalBookings,
          pendingBookings,
          confirmedBookings,
          completedBookings,
          cancelledBookings,
          totalWinners,
          totalContacts,
          unreadContacts,
        },
        recentBookings,
      },
    });
  },
);
