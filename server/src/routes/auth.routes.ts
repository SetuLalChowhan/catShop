import { Router } from "express";
import { login, logout, me, updateProfile } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { protect } from "../middlewares/auth.middleware.js";
import { loginSchema, updateProfileSchema } from "../validations/auth.validation.js";

const router = Router();

router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", protect, me);
router.patch("/profile", protect, validate(updateProfileSchema), updateProfile);

export default router;
