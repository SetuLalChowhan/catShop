import multer from "multer";
import { AppError } from "../utils/AppError.js";

/**
 * Images are held in memory and streamed straight to Cloudinary —
 * nothing is written to the server's disk.
 */
const storage = multer.memoryStorage();

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new AppError("Only image files are allowed", 400));
  }
};

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

export const uploadSingle = uploadImage.single("image");
export const uploadMultiple = uploadImage.array("images", 6);

export default uploadImage;
