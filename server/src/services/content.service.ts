import { ContentModel, type ContentDocument } from "../models/Content.model.js";

const DEFAULT_CONTENT = {
  key: "main",
  brand: {
    name: "Whisker Haven",
    tagline: "Premium kittens, raised with love",
    description: "Dedicated to raising healthy, socialized, and beautiful cats in a home environment filled with love and care.",
    announcementBar: "Ethical & Loving Cat Breeding • Reserve your purebred companion today",
    footerText: "All kittens come fully vaccinated, health-checked, and microchipped before joining your home.",
  },
  home: {
    heroTitle: "Purebred Kittens Raised in a Loving Home",
    heroSubtitle: "Ethical Cattery & Purebred Companions",
    heroImage: null,
    primaryCta: { label: "Browse Available Cats", href: "/cats" },
    secondaryCta: { label: "Submit Reservation Request", href: "/booking" },
    introTitle: "A Cattery Built on Love & Care",
    introText: "Every kitten in our care is raised indoors, vaccinated, dewormed, and socialized daily in a family home environment.",
    catsSectionTitle: "Meet Our Available Companions",
    catsSectionSubtitle: "Explore our current litter of health-checked, pedigreed kittens.",
    winnersSectionTitle: "Referral Winners & Recognition",
    winnersSectionSubtitle: "We celebrate our adopter community! Every month we reward top customer referrals.",
  },
  about: {
    title: "Dedicated to Raising Healthy & Happy Companion Cats",
    story: "Whisker Haven was founded out of a deep passion for cat welfare and ethical breeding standards. We raise purebred kittens inside our loving home environment rather than cages.",
    mission: "Our mission is to match every kitten with a loving forever home, providing lifetime support, full health guarantees, and complete pedigree transparency.",
    images: [],
  },
  contact: {
    phone: "+1 (555) 234-5678",
    email: "hello@whiskerhaven.com",
    facebook: "https://facebook.com",
    messenger: "https://m.me",
    address: "123 Whisker Way, Loving Home Cattery",
    hours: "Mon - Sun: 9:00 AM - 7:00 PM (Visits by appointment)",
  },
} as const;

export async function getContentDocument(): Promise<ContentDocument> {
  const existing = await ContentModel.findOne({ key: "main" });
  if (existing) {
    return existing;
  }

  const created = await ContentModel.create(DEFAULT_CONTENT);
  return created;
}

export async function getPublicContent() {
  const doc = await getContentDocument();
  const obj = doc.toObject();
  delete (obj as { key?: string }).key;
  return obj;
}
