import type { Response } from "express";
import { getContentDocument, getPublicContent } from "../services/content.service.js";
import { deleteImage } from "../services/cloudinary.service.js";
import { catchAsync } from "../utils/catchAsync.js";
import type { AuthenticatedRequest } from "../types/index.js";

/** GET /api/content — all public website content. */
export const getContent = catchAsync(async (_req: AuthenticatedRequest, res: Response) => {
  const content = await getPublicContent();
  res.status(200).json({ status: "success", data: { content } });
});

/** PATCH /api/content — update any section (admin). */
export const updateContent = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const doc = await getContentDocument();
    const docObj = doc.toObject() as any;

    const body = req.body as Record<string, Record<string, any>>;

    const home = docObj.home ?? {};
    const about = docObj.about ?? {};
    const brand = docObj.brand ?? {};
    const contact = docObj.contact ?? {};

    // Clean up replaced hero/about images from Cloudinary.
    const replacedAssets: Array<{ old?: string; next?: string }> = [];
    if (body.home?.heroImage !== undefined && home.heroImage) {
      replacedAssets.push({
        old: home.heroImage.publicId,
        next: body.home.heroImage?.publicId,
      });
    }
    if (body.about?.images !== undefined && Array.isArray(about.images)) {
      const oldIds = new Set<string>(about.images.map((i: any) => i.publicId));
      const newIds = new Set<string>(
        (body.about.images as any[]).map((i: any) => i.publicId),
      );
      for (const id of oldIds) {
        if (!newIds.has(id)) replacedAssets.push({ old: id });
      }
    }

    if (body.brand) doc.set("brand", { ...brand, ...body.brand });
    if (body.home) doc.set("home", { ...home, ...body.home });
    if (body.about) doc.set("about", { ...about, ...body.about });
    if (body.contact) doc.set("contact", { ...contact, ...body.contact });

    await doc.save();

    // Delete replaced assets only after the save succeeded.
    await Promise.all(
      replacedAssets
        .filter((r) => r.old && r.old !== r.next)
        .map((r) => deleteImage(r.old)),
    );

    const content = await getPublicContent();
    res.status(200).json({
      status: "success",
      message: "Changes saved successfully",
      data: { content },
    });
  },
);

// Alias exports for /settings endpoint compatibility
export const getSettings = getContent;
export const updateSettings = updateContent;
