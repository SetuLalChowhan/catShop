import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

/** Cloudinary-backed image reference. Only metadata is stored in MongoDB. */
export const imageAssetSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String, default: "" },
  },
  { _id: false },
);

export type ImageAsset = InferSchemaType<typeof imageAssetSchema>;

export const CAT_AVAILABILITY = ["available", "reserved", "sold"] as const;
export type CatAvailability = (typeof CAT_AVAILABILITY)[number];

const catSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Cat name is required"],
      trim: true,
      maxlength: [80, "Name cannot exceed 80 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    breed: {
      type: String,
      required: [true, "Breed is required"],
      trim: true,
      maxlength: [80, "Breed cannot exceed 80 characters"],
    },
    // Age stored in months so "8 weeks" and "2 years" both work.
    ageMonths: {
      type: Number,
      required: [true, "Age is required"],
      min: [0, "Age cannot be negative"],
      max: [480, "Age seems too high (40 years)"],
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: [true, "Gender is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [200, "Short description cannot exceed 200 characters"],
    },
    images: {
      type: [imageAssetSchema],
      default: [],
      validate: {
        validator: (imgs: ImageAsset[]) => imgs.length > 0,
        message: "At least one image is required",
      },
    },
    availability: {
      type: String,
      enum: CAT_AVAILABILITY,
      default: "available",
      index: true,
    },
    // Visibility on the public site.
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    traits: {
      type: [String],
      default: [],
    },
    pedigree: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

// Public listing query: active + availability.
catSchema.index({ status: 1, availability: 1, createdAt: -1 });

export type Cat = InferSchemaType<typeof catSchema>;
export type CatDocument = HydratedDocument<Cat>;

export const CatModel = model<Cat>("Cat", catSchema);
export default CatModel;
