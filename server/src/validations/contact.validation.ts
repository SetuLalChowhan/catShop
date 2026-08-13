import { z } from "zod";

export const createContactSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Please enter your name").max(120),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().max(30).optional().default(""),
    subject: z.string().min(2, "Subject is required").max(200),
    message: z.string().min(10, "Message must be at least 10 characters").max(3000),
  }),
});

export const updateContactSchema = z.object({
  body: z.object({
    status: z.enum(["unread", "read", "replied", "archived"]),
  }),
});
