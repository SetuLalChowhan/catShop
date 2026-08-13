import { z } from "zod";

const imageAssetSchema = z.object({
  url: z.string().min(1),
  publicId: z.string().min(1),
  alt: z.string().optional().default(""),
});

const baseFields = {
  name: z.string().min(1, "Name is required").max(80),
  breed: z.string().min(1, "Breed is required").max(80),
  ageMonths: z.coerce.number().min(0).max(480),
  gender: z.enum(["male", "female"]),
  description: z.string().min(10, "Description is too short").max(5000),
  shortDescription: z.string().max(200).optional().default(""),
  availability: z
    .enum(["available", "reserved", "sold"])
    .optional()
    .default("available"),
  status: z.enum(["active", "archived"]).optional().default("active"),
  isFeatured: z.boolean().optional().default(false),
  traits: z.array(z.string().max(40)).max(10).optional().default([]),
  pedigree: z.string().max(200).optional().default(""),
  images: z.array(imageAssetSchema).max(6).optional(),
};

export const createCatSchema = z.object({
  body: z.object(baseFields),
});

export const updateCatSchema = z.object({
  body: z
    .object({
      ...baseFields,
      deleteImages: z.array(z.string()).optional().default([]),
    })
    .partial(),
});

export const catParamsSchema = z.object({
  params: z.object({
    slug: z.string().min(1),
  }),
});

export const catIdParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});
