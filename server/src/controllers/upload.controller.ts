import type { Response, NextFunction } from "express";
import { uploadImage, UPLOAD_FOLDERS } from "../services/cloudinary.service.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import type { AuthenticatedRequest } from "../types/index.js";

/**
 * POST /api/admin/upload — single image upload.
 */
export const uploadAsset = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const folder = (req.body.folder as string) || "content";
    const target = UPLOAD_FOLDERS[folder as keyof typeof UPLOAD_FOLDERS] || UPLOAD_FOLDERS.content;

    const file = req.file || (req.files && Array.isArray(req.files) ? req.files[0] : null);
    if (!file) {
      return next(new AppError("No image file provided", 400));
    }

    const result = await uploadImage(file.buffer, { folder: target });

    res.status(201).json({
      status: "success",
      data: {
        url: result.url,
        publicId: result.publicId,
        alt: "",
      },
    });
  },
);

/**
 * POST /api/admin/upload-multiple — multiple image upload.
 */
export const uploadMultipleAssets = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const folder = (req.body.folder as string) || "cats";
    const target = UPLOAD_FOLDERS[folder as keyof typeof UPLOAD_FOLDERS] || UPLOAD_FOLDERS.cats;

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return next(new AppError("No image files provided", 400));
    }

    const uploadPromises = files.map((file) => uploadImage(file.buffer, { folder: target }));
    const results = await Promise.all(uploadPromises);

    const assets = results.map((result) => ({
      url: result.url,
      publicId: result.publicId,
      alt: "",
    }));

    res.status(201).json({
      status: "success",
      data: assets,
    });
  },
);
