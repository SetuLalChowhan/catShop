import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";
import { AppError } from "../utils/AppError.js";

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
}

/**
 * Upload a single image buffer to Cloudinary.
 * The folder keeps assets grouped per entity type.
 */
export function uploadImage(
  buffer: Buffer,
  options: { folder: string; alt?: string },
): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryConfigured()) {
    return Promise.reject(
      new AppError(
        "Cloudinary is not configured. Add CLOUDINARY_* variables to the server .env file.",
        500,
      ),
    );
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: "image",
        transformation: [
          { width: 1600, crop: "limit", quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error || !result) {
          console.error("Cloudinary Upload Error Details:", error);
          const errMsg = error?.message || (typeof error === "string" ? error : "Unknown Cloudinary error");
          reject(new AppError(`Cloudinary upload error: ${errMsg}`, 500));
          return;
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
        });
      },
    );
    stream.end(buffer);
  });
}

/** Remove a previously uploaded asset. No-op if the id is empty. */
export async function deleteImage(publicId?: string | null): Promise<void> {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn(`Failed to delete Cloudinary asset: ${publicId}`, err);
  }
}

export const UPLOAD_FOLDERS = {
  cats: "cat-booking/cats",
  winners: "cat-booking/winners",
  content: "cat-booking/content",
} as const;
