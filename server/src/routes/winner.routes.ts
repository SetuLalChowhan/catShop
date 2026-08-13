import { Router } from "express";
import {
  getWinners,
  createWinner,
  updateWinner,
  deleteWinner,
  moveWinner,
} from "../controllers/winner.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { winnerSchema, updateWinnerSchema, moveWinnerSchema } from "../validations/winner.validation.js";

const router = Router();

// Public
router.get("/", getWinners);

// Admin
router.post("/", protect, validate(winnerSchema), createWinner);
router.patch("/:id", protect, validate(updateWinnerSchema), updateWinner);
router.delete("/:id", protect, deleteWinner);
router.post("/:id/move", protect, validate(moveWinnerSchema), moveWinner);

export default router;
