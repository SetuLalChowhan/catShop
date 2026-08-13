import type { Response, NextFunction } from "express";
import WinnerModel from "../models/Winner.model.js";
import { deleteImage } from "../services/cloudinary.service.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import type { AuthenticatedRequest } from "../types/index.js";

/** Number of winners shown publicly (winner of the month + this list). */
export const PUBLIC_WINNER_LIMIT = 3;

/** GET /api/winners — public: winner of the month + top winners. */
export const getWinners = catchAsync(async (_req: AuthenticatedRequest, res: Response) => {
  const [winnerOfMonth, winners] = await Promise.all([
    WinnerModel.findOne({ isWinnerOfMonth: true, isActive: { $ne: false } }),
    WinnerModel.find({ isWinnerOfMonth: { $ne: true }, isActive: { $ne: false } })
      .sort({ position: 1, createdAt: 1 })
      .limit(PUBLIC_WINNER_LIMIT),
  ]);

  res.status(200).json({
    status: "success",
    data: { winnerOfMonth, winners },
  });
});

// ── Admin ─────────────────────────────────────────────────────────────────────

/** GET /api/admin/winners — everything, ordered by position. */
export const getAdminWinners = catchAsync(async (_req: AuthenticatedRequest, res: Response) => {
  const winners = await WinnerModel.find().sort({ position: 1, createdAt: 1 });
  res.status(200).json({ status: "success", data: { winners } });
});

/** POST /api/admin/winners */
export const createWinner = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const body = req.body as {
      name: string;
      facebookUrl?: string;
      image?: { url: string; publicId: string; alt?: string } | null;
      position?: number;
      isWinnerOfMonth?: boolean;
      isActive?: boolean;
    };

    // Auto-assign the next position when not provided.
    let position = body.position;
    if (!position) {
      const last = await WinnerModel.findOne().sort({ position: -1 });
      position = (last?.position ?? 0) + 1;
    }

    const winner = await WinnerModel.create({
      name: body.name,
      facebookUrl: body.facebookUrl || "",
      image: body.image || null,
      position,
      isWinnerOfMonth: Boolean(body.isWinnerOfMonth),
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    });

    if (winner.isWinnerOfMonth) {
      await WinnerModel.updateMany(
        { _id: { $ne: winner._id } },
        { $set: { isWinnerOfMonth: false } },
      );
    }

    res.status(201).json({
      status: "success",
      message: "Winner added successfully",
      data: { winner },
    });
  },
);

/** PATCH /api/admin/winners/:id */
export const updateWinner = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const winner = await WinnerModel.findById(req.params.id);
    if (!winner) return next(new AppError("Winner not found", 404));

    const body = req.body as Record<string, any>;
    if (body.name !== undefined) winner.name = body.name;
    if (body.facebookUrl !== undefined) winner.facebookUrl = body.facebookUrl;
    if (body.position !== undefined) winner.position = body.position;
    if (body.isActive !== undefined) winner.isActive = Boolean(body.isActive);

    // Image replacement → delete the old Cloudinary asset.
    if (body.image !== undefined) {
      if (winner.image?.publicId && winner.image.publicId !== body.image?.publicId) {
        await deleteImage(winner.image.publicId);
      }
      winner.image = body.image || null;
    }

    if (body.isWinnerOfMonth === true && !winner.isWinnerOfMonth) {
      await WinnerModel.updateMany(
        { _id: { $ne: winner._id } },
        { $set: { isWinnerOfMonth: false } },
      );
      winner.isWinnerOfMonth = true;
    } else if (body.isWinnerOfMonth === false) {
      winner.isWinnerOfMonth = false;
    }

    await winner.save();

    res.status(200).json({
      status: "success",
      message: "Winner updated successfully",
      data: { winner },
    });
  },
);

/** DELETE /api/admin/winners/:id */
export const deleteWinner = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const winner = await WinnerModel.findById(req.params.id);
    if (!winner) return next(new AppError("Winner not found", 404));

    await deleteImage(winner.image?.publicId);
    await winner.deleteOne();

    res.status(200).json({
      status: "success",
      message: "Winner deleted successfully",
    });
  },
);

/**
 * POST /api/admin/winners/:id/move — swap positions with the neighbour
 * so admins can reorder winners with simple up/down controls.
 */
export const moveWinner = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { direction } = req.body as { direction: "up" | "down" };

    const winner = await WinnerModel.findById(req.params.id);
    if (!winner) return next(new AppError("Winner not found", 404));

    const neighbour = await WinnerModel.findOne({
      position: direction === "up" ? { $lt: winner.position } : { $gt: winner.position },
    }).sort({ position: direction === "up" ? -1 : 1 });

    if (!neighbour) {
      return res.status(200).json({
        status: "success",
        message: "Already at the edge",
        data: { winners: await WinnerModel.find().sort({ position: 1 }) },
      });
    }

    const tmp = neighbour.position;
    neighbour.position = winner.position;
    winner.position = tmp;

    await Promise.all([neighbour.save(), winner.save()]);

    const winners = await WinnerModel.find().sort({ position: 1, createdAt: 1 });
    res.status(200).json({
      status: "success",
      message: "Order updated",
      data: { winners },
    });
  },
);
