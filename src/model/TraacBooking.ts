import { Schema, model, Document } from "mongoose";

export interface BookingDocument extends Document {
  type: "corporate" | "retail" | "channel";

  clientName: string;
  traacsCode: string;
  companyEmail: string;

  // Corporate only
  bookerEmail?: string;

  // Retail / Channel
  bookerName?: string;
  paymentDetail?: string;
  receiptFile?: string;

  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<BookingDocument>(
  {
    type: { type: String, enum: ["corporate", "retail", "channel"], required: true },

    clientName: { type: String, required: true },
    traacsCode: { type: String, required: true },
    companyEmail: { type: String, required: true },

    bookerEmail: { type: String },

    bookerName: { type: String },
    paymentDetail: { type: String },
    receiptFile: { type: String },
  },
  { timestamps: true }
);

export const Booking = model<BookingDocument>("Booking", BookingSchema);
