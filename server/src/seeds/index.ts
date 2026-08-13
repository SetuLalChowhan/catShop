import AdminModel from "../models/Admin.model.js";
import CatModel from "../models/Cat.model.js";
import WinnerModel from "../models/Winner.model.js";
import { getContentDocument } from "../services/content.service.js";
import { hashPassword } from "../utils/auth.util.js";

/**
 * Idempotent seeds, safe to run on every boot:
 *  - creates the default admin (only if none exists)
 *  - ensures the single content document exists with defaults
 *  - seeds sample cats and referral winners if empty
 */
export async function runSeeds(): Promise<void> {
  await seedAdmin();
  await getContentDocument();
  await seedCats();
  await seedWinners();
  console.log("Seeds checked ✅");
}

async function seedAdmin(): Promise<void> {
  const adminCount = await AdminModel.countDocuments();
  if (adminCount > 0) return;

  const email = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Admin";

  await AdminModel.create({
    name,
    email,
    password: await hashPassword(password),
    role: "superadmin",
  });

  console.log(`Default admin created → ${email}`);
}

async function seedCats(): Promise<void> {
  const catCount = await CatModel.countDocuments();
  if (catCount > 0) return;

  const sampleCats = [
    {
      name: "Luna",
      slug: "luna-persian-kitten",
      breed: "Persian",
      ageMonths: 4,
      gender: "female",
      description: "Luna is a gentle, affectionate white Persian kitten with striking blue eyes. She loves gentle cuddling and playing with ribbon toys.",
      shortDescription: "Sweet-tempered 4-month-old Persian kitten with silky white coat.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=800&auto=format&fit=crop",
          publicId: "seed-luna-1",
          alt: "Luna Persian Kitten",
        },
      ],
      availability: "available",
      status: "active",
      isFeatured: true,
      traits: ["Vaccinated", "TICA Pedigree", "Gentle"],
      pedigree: "TICA Registered Lineage",
    },
    {
      name: "Oliver",
      slug: "oliver-british-shorthair",
      breed: "British Shorthair",
      ageMonths: 5,
      gender: "male",
      description: "Oliver is a classic blue British Shorthair with a plush double coat and friendly personality. Great with kids and quiet homes.",
      shortDescription: "Calm and friendly 5-month-old Blue British Shorthair male.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=800&auto=format&fit=crop",
          publicId: "seed-oliver-1",
          alt: "Oliver British Shorthair",
        },
      ],
      availability: "available",
      status: "active",
      isFeatured: true,
      traits: ["Vaccinated", "Microchipped", "Playful"],
      pedigree: "GCCF Champion Bloodline",
    },
    {
      name: "Milo",
      slug: "milo-ragdoll-kitten",
      breed: "Ragdoll",
      ageMonths: 3,
      gender: "male",
      description: "Milo is a floppy seal point Ragdoll kitten who follows family members around the house. Highly socialized and affectionate.",
      shortDescription: "Affectionate 3-month-old seal point Ragdoll male kitten.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=800&auto=format&fit=crop",
          publicId: "seed-milo-1",
          alt: "Milo Ragdoll Kitten",
        },
      ],
      availability: "available",
      status: "active",
      isFeatured: true,
      traits: ["Pedigree", "Lap Cat", "Dewormed"],
      pedigree: "CFA Registered Lineage",
    },
    {
      name: "Bella",
      slug: "bella-scottish-fold",
      breed: "Scottish Fold",
      ageMonths: 6,
      gender: "female",
      description: "Bella is a charming Scottish Fold kitten with folded ears and large round eyes. Fully vaccinated and litter trained.",
      shortDescription: "Charming 6-month-old Scottish Fold female kitten.",
      images: [
        {
          url: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=800&auto=format&fit=crop",
          publicId: "seed-bella-1",
          alt: "Bella Scottish Fold",
        },
      ],
      availability: "reserved",
      status: "active",
      isFeatured: false,
      traits: ["Litter Trained", "Health Tested"],
      pedigree: "Certified Pedigree",
    },
  ];

  await CatModel.insertMany(sampleCats);
  console.log("Sample cats seeded 🐱");
}

async function seedWinners(): Promise<void> {
  const winnerCount = await WinnerModel.countDocuments();
  if (winnerCount > 0) return;

  const sampleWinners = [
    {
      name: "Sarah Jenkins",
      image: {
        url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
        publicId: "seed-winner-sarah",
      },
      facebookUrl: "https://facebook.com/sarahjenkins",
      position: 1,
      isWinnerOfMonth: true,
    },
    {
      name: "David Miller",
      image: {
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
        publicId: "seed-winner-david",
      },
      facebookUrl: "https://facebook.com/davidmiller",
      position: 2,
      isWinnerOfMonth: false,
    },
    {
      name: "Emily Watson",
      image: {
        url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop",
        publicId: "seed-winner-emily",
      },
      facebookUrl: "https://facebook.com/emilywatson",
      position: 3,
      isWinnerOfMonth: false,
    },
  ];

  await WinnerModel.insertMany(sampleWinners);
  console.log("Sample referral winners seeded 🏆");
}
