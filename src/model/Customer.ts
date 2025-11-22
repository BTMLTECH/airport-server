import { Schema, model, Document } from "mongoose";

// ============================
// 🧩 Interface
// ============================
export interface CustomerDocument extends Document {
  passengerName: string;
  contact: string;
  email: string;
  btmProtocolOfficerName?: string;
  partnerProtocolOfficerName?: string;
  partnerProtocolOfficerMobile?: string;
  badgeVerification?: "yes" | "no";
  checkInIssues?: "yes" | "no";
  checkInComment?: string;
  discountCode?: string;
  discountValidated?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================
// 🧩 Schema
// ============================
const CustomerSchema = new Schema<CustomerDocument>(
  {
    passengerName: { type: String, required: true },
    contact: { type: String, required: true },
    email: { type: String, required: true },

    btmProtocolOfficerName: { type: String },
    partnerProtocolOfficerName: { type: String },
    partnerProtocolOfficerMobile: { type: String },

    badgeVerification: { type: String, enum: ["yes", "no"], default: "no" },
    checkInIssues: { type: String, enum: ["yes", "no"], default: "no" },
    checkInComment: { type: String },
        // 🆕 Discount Code added here
    discountCode: { type: String, default: null },
    discountValidated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ============================
// 🧩 Model
// ============================
export const Customer = model<CustomerDocument>("Customer", CustomerSchema);
