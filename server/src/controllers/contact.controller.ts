import type { Response, NextFunction } from "express";
import ContactModel, { type ContactStatus } from "../models/Contact.model.js";
import { AppError } from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import type { AuthenticatedRequest } from "../types/index.js";

/** POST /api/contacts — public contact message submission. */
export const createContact = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const body = req.body as {
      name: string;
      email: string;
      phone?: string;
      subject: string;
      message: string;
    };

    const contact = await ContactModel.create({
      name: body.name,
      email: body.email,
      phone: body.phone || "",
      subject: body.subject,
      message: body.message,
      status: "unread",
    });

    res.status(201).json({
      status: "success",
      message: "Your message has been sent successfully. We will get back to you soon!",
      data: { contact },
    });
  },
);

// ── Admin ─────────────────────────────────────────────────────────────────────

/** GET /api/admin/contacts — search, filter by status, paginated. */
export const getContacts = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const { search, status, page = "1", limit = "10" } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = {};
    if (status && ["unread", "read", "replied", "archived"].includes(status)) {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [contacts, total] = await Promise.all([
      ContactModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      ContactModel.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limitNum) || 1;

    res.status(200).json({
      status: "success",
      results: contacts.length,
      data: {
        contacts,
        pagination: { page: pageNum, limit: limitNum, total, pages },
      },
    });
  },
);

/** PATCH /api/admin/contacts/:id — update status. */
export const updateContactStatus = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { status } = req.body as { status: ContactStatus };
    const contact = await ContactModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true },
    );

    if (!contact) return next(new AppError("Contact message not found", 404));

    res.status(200).json({
      status: "success",
      data: { contact },
    });
  },
);

/** DELETE /api/admin/contacts/:id */
export const deleteContact = catchAsync(
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const contact = await ContactModel.findByIdAndDelete(req.params.id);
    if (!contact) return next(new AppError("Contact message not found", 404));

    res.status(204).send();
  },
);
