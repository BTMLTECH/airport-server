// import { Schema, model, Document } from "mongoose";

// // ============================
// // 🧩 Interfaces
// // ============================
// export interface SelectedServiceDetail {
//   id: string;
//   label: string;
//   price: number;
// }

// export interface PaymentDocument extends Document {
//   fullName: string;
//   email: string;
//   phone: string;
//   services: string[];
//   flightDate: string;
//   flightTime: string;
//   flightNumber: string;
//   departureCity: string;
//   arrivalCity: string;
//   passengers: string;
//   specialRequests?: string;
//   discountCode?: string;
//   referralSource?: string;
//   totalPrice: number;
//   selectedServicesDetails: SelectedServiceDetail[];
//   currency: string;
//   status: "pending" | "success" | "failed";
//   createdAt: Date;
//   updatedAt: Date;
// }

// // ============================
// // 🧩 Subschema for selected services
// // ============================
// const SelectedServiceDetailSchema = new Schema<SelectedServiceDetail>(
//   {
//     id: { type: String, required: true },
//     label: { type: String, required: true },
//     price: { type: Number, required: true },
//   },
//   { _id: false }
// );

// const PaymentSchema = new Schema<PaymentDocument>(
//   {
//     fullName: { type: String, required: true },
//     email: { type: String, required: true },
//     phone: { type: String, required: true },
//     services: [{ type: String, required: true }],
//     flightDate: { type: String, required: true },
//     flightTime: { type: String, required: true },
//     flightNumber: { type: String, required: true },
//     departureCity: { type: String, required: true },
//     arrivalCity: { type: String, required: true },
//     passengers: { type: String, required: true },
//     specialRequests: { type: String },
//     discountCode: { type: String },
//     referralSource: { type: String },
//     totalPrice: { type: Number, required: true },
//     selectedServicesDetails: {
//       type: [SelectedServiceDetailSchema],
//       required: true,
//     },
//     currency: { type: String, default: "NGN" },
//     status: {
//       type: String,
//       enum: ["pending", "success", "failed"],
//       default: "pending",
//     },
//   },
//   { timestamps: true }
// );

// export const Payment = model<PaymentDocument>("Payment", PaymentSchema);
import { Schema, model, Document } from "mongoose";

// ============================
// 🧩 Interfaces
// ============================
export interface SelectedServiceDetail {
  id: string;
  label: string;
  price: number;
}

export interface PaymentDocument extends Document {
  fullName: string;
  email: string;
  phone: string;
  services: string[];
  flightDate: string;
  flightTime: string;
  flightNumber: string;
  departureCity: string;
  arrivalCity: string;
  passengers: string;
  specialRequests?: string;
  discountCode?: string;
  referralSource?: string;
  totalPrice: number;
  selectedServicesDetails: SelectedServiceDetail[];
  currency: string;
  status: "pending" | "success" | "failed";
  type: "domestic" | "international"; // ✅ added here
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
    price: { type: Number, required: true },
  },
  { _id: false }
);

const PaymentSchema = new Schema<PaymentDocument>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    services: [{ type: String, required: true }],
    flightDate: { type: String, required: true },
    flightTime: { type: String, required: true },
    flightNumber: { type: String, required: true },
    departureCity: { type: String, required: true },
    arrivalCity: { type: String, required: true },
    passengers: { type: String, required: true },
    specialRequests: { type: String },
    discountCode: { type: String },
    referralSource: { type: String },
    totalPrice: { type: Number, required: true },
    selectedServicesDetails: {
      type: [SelectedServiceDetailSchema],
      required: true,
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
  },
  { timestamps: true }
);

export const Payment = model<PaymentDocument>("Payment", PaymentSchema);
