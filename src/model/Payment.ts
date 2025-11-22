import { Schema, model, Document } from "mongoose";

// ============================
// 🧩 Interfaces
// ============================
export interface SelectedServiceDetail {
  id: string;
  label: string;
  price?: number;       
  dollar?: number;       
  options?: any[];       
  selectedFlight?: string;
  serviceType?: "online" | "offline"; 
}

export interface PaymentDocument extends Document {
  fullName: string;
  email: string;
  phone: string;
  services: string[];
  flightDate: string;
  flightTime: string;
  flightNumber: string;
  arrivalCity: string;
  passengers: string;
  specialRequests?: string;
  discountCode?: string;
  referralSource?: string;

  totalPrice: number;
  totalDollarPrice?: number;

  selectedServicesDetails?: SelectedServiceDetail[];

  currency: string;
  status: "pending" | "success" | "failed";
  type: "domestic" | "international";
  reference: string;

  // ✅ Return service
  returnService?: boolean;
  returnDate?: string;
  returnFlight?: string;
  returnNotes?: string;
  companyName?: string;

  feedbackSent?: boolean;
  feedbackSentAt?: string;
  isFreeRequest?: boolean;
  reminderSent?: boolean;
  reminderSentAt?: string;


  createdAt: Date;
  updatedAt: Date;
}

// ============================
// 🧩 Subschema for selected services
// ============================
const SelectedServiceDetailSchema = new Schema<SelectedServiceDetail>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    price: { type: Number, required: false },
    dollar: { type: Number, required: false },
    options: { type: Array, required: false },
    selectedFlight: { type: String, required: false },
    serviceType: { type: String, enum: ["online", "offline"], required: false }, // NEW
  },
  { _id: false }
);

// ============================
// 🧩 Main Payment Schema
// ============================
const PaymentSchema = new Schema<PaymentDocument>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    services: [{ type: String, required: true }],
    flightDate: { type: String, required: true },
    flightTime: { type: String, required: true },
    flightNumber: { type: String, required: true },
    arrivalCity: { type: String, required: true },
    passengers: { type: String, required: true },
    specialRequests: { type: String },
    discountCode: { type: String },
    referralSource: { type: String },
    feedbackSent: { type: Boolean, default: false },
    isFreeRequest: { type: Boolean, default: false },
      reminderSent: {
    type: Boolean,
    default: false,   
  },
    totalPrice: { type: Number, required: true },
    totalDollarPrice: { type: Number, required: false },
    companyName: { type: String, default: "BTMTravel-Protocol" },
    selectedServicesDetails: {
      type: [SelectedServiceDetailSchema],
      required: false,
    },

    currency: { type: String, default: "NGN" },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    type: {
      type: String,
      enum: ["domestic", "international"],
      required: true,
    },
    reference: { type: String, required: true, unique: true },

    returnService: { type: Boolean },
    feedbackSentAt: {
        type: String,
        default: null
      },
    reminderSentAt: {
        type: String,
        default: null
      },
    returnDate: { type: String },
    returnFlight: { type: String },
    returnNotes: { type: String },

  },
  
  { timestamps: true }
);

export const Payment = model<PaymentDocument>("Payment", PaymentSchema);
