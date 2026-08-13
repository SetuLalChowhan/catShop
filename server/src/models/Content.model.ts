import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { imageAssetSchema } from "./Cat.model.js";

/**
 * Single-document CMS for full site-wide content control.
 */
const contentSchema = new Schema(
  {
    key: {
      type: String,
      default: "main",
      unique: true,
    },
    brand: {
      name: { type: String, default: "Whisker Haven" },
      tagline: { type: String, default: "Premium kittens, raised with love" },
      description: { type: String, default: "Dedicated to raising healthy, socialized, and beautiful cats in a home environment filled with love and care." },
      announcementBar: { type: String, default: "Ethical & Loving Cat Breeding • Reserve your purebred companion today" },
      footerText: { type: String, default: "All kittens come fully vaccinated, health-checked, and microchipped before joining your home." },
      logoImage: { type: imageAssetSchema, default: null },
    },
    home: {
      heroTitle: { type: String, default: "Purebred Kittens Raised in a Loving Home" },
      heroSubtitle: { type: String, default: "Ethical Cattery & Purebred Companions" },
      introText: { type: String, default: "Every kitten in our care is raised indoors, vaccinated, dewormed, and socialized daily in a family home environment." },
      heroImage: { type: imageAssetSchema, default: null },
      primaryCta: {
        label: { type: String, default: "Browse Available Cats" },
        href: { type: String, default: "/cats" },
      },
      secondaryCta: {
        label: { type: String, default: "Submit Reservation Request" },
        href: { type: String, default: "/booking" },
      },
      catsSectionTitle: { type: String, default: "Meet Our Available Companions" },
      catsSectionSubtitle: { type: String, default: "Explore our current litter of health-checked, pedigreed kittens." },
      winnersSectionTitle: { type: String, default: "Referral Winners & Recognition" },
      winnersSectionSubtitle: { type: String, default: "We celebrate our adopter community! Every month we reward top customer referrals." },
    },
    about: {
      title: { type: String, default: "Dedicated to Raising Healthy & Happy Companion Cats" },
      story: { type: String, default: "Whisker Haven was founded out of a deep passion for cat welfare and ethical breeding standards. We raise purebred kittens inside our loving home environment rather than cages." },
      mission: { type: String, default: "Our mission is to match every kitten with a loving forever home, providing lifetime support, full health guarantees, and complete pedigree transparency." },
      images: { type: [imageAssetSchema], default: [] },
    },
    contact: {
      phone: { type: String, default: "+1 (555) 234-5678" },
      email: { type: String, default: "hello@whiskerhaven.com" },
      facebook: { type: String, default: "https://facebook.com" },
      messenger: { type: String, default: "https://m.me" },
      address: { type: String, default: "123 Whisker Way, Loving Home Cattery" },
      hours: { type: String, default: "Mon - Sun: 9:00 AM - 7:00 PM (Visits by appointment)" },
    },
  },
  { timestamps: true },
);

export type WebsiteContent = InferSchemaType<typeof contentSchema>;
export type ContentDocument = HydratedDocument<WebsiteContent>;

export const ContentModel = model<WebsiteContent>("WebsiteContent", contentSchema);
export default ContentModel;
