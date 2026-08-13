import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { uploadSingle, uploadMultiple } from "../middlewares/upload.middleware.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { getAdminCats } from "../controllers/cat.controller.js";
import { getBookings } from "../controllers/booking.controller.js";
import { getAdminWinners } from "../controllers/winner.controller.js";
import { uploadAsset, uploadMultipleAssets } from "../controllers/upload.controller.js";
import { getContacts, updateContactStatus, deleteContact } from "../controllers/contact.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { updateContactSchema } from "../validations/contact.validation.js";

const router = Router();

// Everything below requires an authenticated admin.
router.use(protect);

router.get("/stats", getDashboardStats);
router.get("/cats", getAdminCats);
router.get("/bookings", getBookings);
router.get("/winners", getAdminWinners);
router.get("/contacts", getContacts);
router.patch("/contacts/:id", validate(updateContactSchema), updateContactStatus);
router.delete("/contacts/:id", deleteContact);

// Image upload routes: admin → backend → Cloudinary → asset ref
router.post("/upload", uploadSingle, uploadAsset);
router.post("/uploads", uploadSingle, uploadAsset);
router.post("/upload-multiple", uploadMultiple, uploadMultipleAssets);
router.post("/uploads-multiple", uploadMultiple, uploadMultipleAssets);

export default router;
