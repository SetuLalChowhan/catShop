import { Router } from "express";
import {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  deleteBooking,
} from "../controllers/booking.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createBookingSchema, updateBookingSchema } from "../validations/booking.validation.js";

const router = Router();

// Public
router.post("/", validate(createBookingSchema), createBooking);

// Admin
router.get("/", protect, getBookings);
router.get("/:id", protect, getBooking);
router.patch("/:id", protect, validate(updateBookingSchema), updateBooking);
router.delete("/:id", protect, deleteBooking);

export default router;
