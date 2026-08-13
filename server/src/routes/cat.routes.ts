import { Router } from "express";
import {
  getCats,
  getCatBySlug,
  createCat,
  updateCat,
  deleteCat,
} from "../controllers/cat.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createCatSchema,
  updateCatSchema,
  catParamsSchema,
  catIdParamsSchema,
} from "../validations/cat.validation.js";

const router = Router();

// Public
router.get("/", getCats);
router.get("/:slug", validate(catParamsSchema), getCatBySlug);

// Admin
router.post("/", protect, validate(createCatSchema), createCat);
router.patch("/:id", protect, validate(updateCatSchema), validate(catIdParamsSchema), updateCat);
router.delete("/:id", protect, deleteCat);

export default router;
