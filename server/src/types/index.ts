import type { Request } from "express";
import type { AdminDocument } from "../models/Admin.model.js";

/**
 * Extend Express requests with the authenticated admin.
 * Access via `req.admin` after the `protect` middleware.
 */
export interface AuthenticatedRequest extends Request {
  admin?: AdminDocument;
}

export type { AdminDocument };
