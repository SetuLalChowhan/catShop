import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

export const CONTACT_STATUS = ["unread", "read", "replied", "archived"] as const;
export type ContactStatus = (typeof CONTACT_STATUS)[number];

const contactSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [120, "Name cannot exceed 120 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      trim: true,
      default: "",
      maxlength: [30, "Phone number cannot exceed 30 characters"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [3000, "Message cannot exceed 3000 characters"],
    },
    status: {
      type: String,
      enum: CONTACT_STATUS,
      default: "unread",
      index: true,
    },
  },
  { timestamps: true },
);

contactSchema.index({ status: 1, createdAt: -1 });

export type ContactMessage = InferSchemaType<typeof contactSchema>;
export type ContactDocument = HydratedDocument<ContactMessage>;

export const ContactModel = model<ContactMessage>("Contact", contactSchema);
export default ContactModel;
