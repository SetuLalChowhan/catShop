import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";
import { imageAssetSchema } from "./Cat.model.js";

const winnerSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Winner name is required"],
      trim: true,
      maxlength: [120, "Name cannot exceed 120 characters"],
    },
    image: {
      type: imageAssetSchema,
      default: null,
    },
    facebookUrl: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: (v: string) =>
          !v ||
          /^https?:\/\/(www\.)?(facebook\.com|fb\.com|m\.facebook\.com)(\/.*)?$/i.test(v),
        message: "Please provide a valid Facebook profile URL",
      },
    },
    // Display order (1 = first). Managed by the admin.
    position: {
      type: Number,
      default: 0,
    },
    isWinnerOfMonth: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

winnerSchema.index({ position: 1 });

export type Winner = InferSchemaType<typeof winnerSchema>;
export type WinnerDocument = HydratedDocument<Winner>;

export const WinnerModel = model<Winner>("Winner", winnerSchema);
export default WinnerModel;
