import { v2 as cloudinary } from "cloudinary";

/**
 * Configure the Cloudinary SDK from environment variables.
 * Called once at server startup.
 */
export function configureCloudinary(): void {
  const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim();

  // Cloudinary configuration
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

/** True when Cloudinary credentials have been provided. */
export function isCloudinaryConfigured(): boolean {
  const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
  const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim();
  const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim();

  return Boolean(cloudName && apiKey && apiSecret);
}

export { cloudinary };
