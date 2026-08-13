import { z } from "zod";

const ctaSchema = z.object({
  label: z.string().max(60).optional(),
  href: z.string().max(200).optional(),
});

const imageAssetSchema = z.object({
  url: z.string().min(1),
  publicId: z.string().min(1),
  alt: z.string().optional(),
});

export const updateContentSchema = z.object({
  body: z.object({
    brand: z
      .object({
        name: z.string().max(80).optional(),
        tagline: z.string().max(120).optional(),
        description: z.string().max(1000).optional(),
      })
      .optional(),
    home: z
      .object({
        heroTitle: z.string().max(120).optional(),
        heroSubtitle: z.string().max(600).optional(),
        heroImage: imageAssetSchema.nullable().optional(),
        primaryCta: ctaSchema.optional(),
        secondaryCta: ctaSchema.optional(),
        introTitle: z.string().max(120).optional(),
        introText: z.string().max(2000).optional(),
      })
      .optional(),
    about: z
      .object({
        title: z.string().max(120).optional(),
        story: z.string().max(5000).optional(),
        mission: z.string().max(2000).optional(),
        images: z.array(imageAssetSchema).max(4).optional(),
      })
      .optional(),
    contact: z
      .object({
        phone: z.string().max(30).optional(),
        email: z.string().email().optional().or(z.literal("")),
        facebook: z.string().max(300).optional(),
        messenger: z.string().max(300).optional(),
        address: z.string().max(300).optional(),
        hours: z.string().max(200).optional(),
      })
      .optional(),
  }),
});
