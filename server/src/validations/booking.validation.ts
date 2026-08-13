import { z } from "zod";

export const createBookingSchema = z.object({
  body: z.object({
    customerName: z.string().min(2, "Please enter your full name").max(120),
    email: z.string().email("Enter a valid email address"),
    phone: z.string().min(5, "Enter a valid phone number").max(30),
    cat: z.string().optional().nullable(),
    preferredDate: z.string().optional().nullable(),
    message: z.string().max(2000).optional().default(""),
  }),
});

export const updateBookingSchema = z.object({
  body: z.object({
    status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
  }),
});
