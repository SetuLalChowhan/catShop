import { Router } from "express";
import {
  getContent,
  updateContent,
  getSettings,
  updateSettings,
} from "../controllers/content.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { updateContentSchema } from "../validations/content.validation.js";

const router = Router();

// Public
router.get("/content", getContent);
router.get("/settings", getSettings);

// Admin
router.patch("/content", protect, validate(updateContentSchema), updateContent);
router.patch("/settings", protect, updateSettings);

export default router;
