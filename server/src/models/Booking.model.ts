import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

export const BOOKING_STATUS = ["pending", "confirmed", "completed", "cancelled"] as const;
export type BookingStatus = (typeof BOOKING_STATUS)[number];

const bookingSchema = new Schema(
  {
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
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
      required: [true, "Phone number is required"],
      trim: true,
      maxlength: [30, "Phone number cannot exceed 30 characters"],
    },
    cat: {
      type: Schema.Types.ObjectId,
      ref: "Cat",
      default: null,
    },
    preferredDate: {
      type: Date,
      default: null,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
      default: "",
    },
    status: {
      type: String,
      enum: BOOKING_STATUS,
      default: "pending",
      index: true,
    },
  },
  { timestamps: true },
);

bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ customerName: "text", email: "text", phone: "text" });

export type Booking = InferSchemaType<typeof bookingSchema>;
export type BookingDocument = HydratedDocument<Booking>;

export const BookingModel = model<Booking>("Booking", bookingSchema);
export default BookingModel;
