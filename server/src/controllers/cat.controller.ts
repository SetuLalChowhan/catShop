import type { Response, NextFunction } from "express";
import CatModel, { type ImageAsset } from "../models/Cat.model.js";
import { slugify, uniqueSlug } from "../utils/slugify.js";
import { deleteImage } from "../services/cloudinary.service.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import type { AuthenticatedRequest } from "../types/index.js";

const PUBLIC_LIST_FILTER = { status: "active" };

/** Maximum number of images allowed per cat (matches client uploader). */
const MAX_CAT_IMAGES = 8;

/** GET /api/cats — public listing with optional filters & pagination. */
export const getCats = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const query = req.query as Record<string, string>;
    const filter: Record<string, unknown> = { ...PUBLIC_LIST_FILTER };

    if (query.availability && ["available", "reserved", "sold"].includes(query.availability)) {
      filter.availability = query.availability;
    }
    if (query.breed) filter.breed = query.breed;
    if (query.gender) filter.gender = query.gender;

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { breed: { $regex: query.search, $options: "i" } },
      ];
    }

    if (query.page || query.limit) {
      const pageNum = Math.max(1, parseInt(query.page, 10) || 1);
      const limitNum = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 6));
      const skip = (pageNum - 1) * limitNum;

      const [cats, total] = await Promise.all([
        CatModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
        CatModel.countDocuments(filter),
      ]);

      const pages = Math.ceil(total / limitNum) || 1;

      res.status(200).json({
        status: "success",
        results: cats.length,
        data: {
          cats,
          pagination: { page: pageNum, limit: limitNum, total, pages },
        },
      });
      return;
    }

    const cats = await CatModel.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ status: "success", results: cats.length, data: { cats } });
  },
);

/** GET /api/cats/:slug — public single cat. */
export const getCatBySlug = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const cat = await CatModel.findOne({ slug: req.params.slug, ...PUBLIC_LIST_FILTER });
    if (!cat) return next(new AppError("Cat not found", 404));

    res.status(200).json({ status: "success", data: { cat } });
  },
);

// ── Admin ─────────────────────────────────────────────────────────────────────

/** GET /api/admin/cats — full list with search + pagination. */
export const getAdminCats = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { search, availability, status, page = "1", limit = "12" } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { breed: { $regex: search, $options: "i" } },
      ];
    }
    if (availability && availability !== "all") filter.availability = availability;
    if (status && status !== "all") filter.status = status;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const [cats, total] = await Promise.all([
      CatModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      CatModel.countDocuments(filter),
    ]);

    res.status(200).json({
      status: "success",
      data: { cats, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } },
    });
  },
);

/** POST /api/admin/cats */
export const createCat = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const body = req.body as Record<string, any>;

    // Ensure the slug is unique (retry with a suffix on collision).
    let slug = slugify(body.name);
    if (await CatModel.exists({ slug })) {
      slug = uniqueSlug(body.name);
    }

    const cat = await CatModel.create({
      name: body.name,
      slug,
      breed: body.breed,
      ageMonths: body.ageMonths,
      gender: body.gender,
      description: body.description,
      shortDescription: body.shortDescription || "",
      images: ((body.images as ImageAsset[]) || []).slice(0, MAX_CAT_IMAGES),
      availability: body.availability || "available",
      status: body.status || "active",
      isFeatured: Boolean(body.isFeatured),
      traits: body.traits || [],
      pedigree: body.pedigree || "",
    });

    res.status(201).json({
      status: "success",
      message: "Cat added successfully",
      data: { cat },
    });
  },
);

/** PATCH /api/admin/cats/:id */
export const updateCat = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const cat = await CatModel.findById(req.params.id);
    if (!cat) return next(new AppError("Cat not found", 404));

    const body = req.body as Record<string, any>;
    const fields = [
      "name", "breed", "ageMonths", "gender", "description", "shortDescription",
      "availability", "status", "isFeatured", "traits", "pedigree",
    ] as const;

    for (const field of fields) {
      if (body[field] !== undefined) {
        cat.set(field, body[field]);
      }
    }

    // Name changes → regenerate slug (keep old slug stable if name unchanged).
    if (body.name && body.name !== cat.name) {
      let slug = slugify(body.name);
      if (await CatModel.exists({ slug, _id: { $ne: cat._id } })) {
        slug = uniqueSlug(body.name);
      }
      cat.slug = slug;
    }

    // Image replacement: the client always sends the full desired set, so
    // replace wholesale and clean up Cloudinary assets that were removed
    // (avoids duplicates from merging the old list with the new one).
    if (Array.isArray(body.images)) {
      const nextImages = (body.images as ImageAsset[]).slice(0, MAX_CAT_IMAGES);
      const nextIds = new Set(nextImages.map((img) => img.publicId));
      const removed = cat.images.filter((img) => !nextIds.has(img.publicId));
      cat.set("images", nextImages);
      if (removed.length > 0) {
        await Promise.all(removed.map((img) => deleteImage(img.publicId)));
      }
    }

    // Legacy/backwards-compat: explicit publicId delete list.
    if (Array.isArray(body.deleteImages) && body.deleteImages.length > 0) {
      const toDelete = new Set<string>(body.deleteImages);
      const kept = cat.images.filter((img) => !toDelete.has(img.publicId));
      cat.set("images", kept);
      await Promise.all([...toDelete].map((publicId) => deleteImage(publicId)));
    }

    await cat.save();

    res.status(200).json({
      status: "success",
      message: "Cat updated successfully",
      data: { cat },
    });
  },
);

/** DELETE /api/admin/cats/:id */
export const deleteCat = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const cat = await CatModel.findById(req.params.id);
    if (!cat) return next(new AppError("Cat not found", 404));

    // Remove Cloudinary assets to avoid orphans.
    await Promise.all(cat.images.map((img) => deleteImage(img.publicId)));
    await cat.deleteOne();

    res.status(200).json({
      status: "success",
      message: "Cat deleted successfully",
    });
  },
);
