import { Router } from "express";
import { createContact } from "../controllers/contact.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createContactSchema } from "../validations/contact.validation.js";

const router = Router();

// Public submission
router.post("/", validate(createContactSchema), createContact);

export default router;
