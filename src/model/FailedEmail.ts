// model/FailedEmail.ts
import mongoose, { Document, Schema } from "mongoose";

export interface FailedEmailDocument extends Document {
  to: string;
  subject: string;
  template: string;
  payload: any;
  error: string;
  attempts: number;
  lastAttempt: Date;
  source: string; // e.g., "payment", "booking", "customer"
  createdAt: Date;
  updatedAt: Date;
}

const FailedEmailSchema = new Schema<FailedEmailDocument>(
  {
    to: { type: String, required: true },
    subject: { type: String, required: true },
    template: { type: String, required: true },
    payload: { type: Object, required: true },
    error: { type: String, required: true },
    attempts: { type: Number, default: 1 },
    lastAttempt: { type: Date, default: Date.now },
    source: { type: String, required: true },
  },
  { timestamps: true }
);

export const FailedEmail = mongoose.model<FailedEmailDocument>("FailedEmail", FailedEmailSchema);
