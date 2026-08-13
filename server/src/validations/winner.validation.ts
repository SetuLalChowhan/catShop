import { z } from "zod";

const facebookUrl = z
  .string()
  .regex(
    /^https?:\/\/(www\.)?(facebook\.com|fb\.com|m\.facebook\.com)\//i,
    "Enter a valid Facebook profile URL",
  )
  .optional()
  .or(z.literal(""));

export const winnerSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(120),
    facebookUrl: facebookUrl,
    position: z.coerce.number().int().min(1).optional(),
    isWinnerOfMonth: z.boolean().optional().default(false),
    isActive: z.boolean().optional().default(true),
  }),
});

export const updateWinnerSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, "Name is required").max(120),
      facebookUrl: facebookUrl,
      position: z.coerce.number().int().min(1),
      isWinnerOfMonth: z.boolean(),
      isActive: z.boolean(),
    })
    .partial(),
});

export const moveWinnerSchema = z.object({
  body: z.object({
    direction: z.enum(["up", "down"]),
  }),
});
