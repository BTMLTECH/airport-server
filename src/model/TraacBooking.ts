// import { Schema, model, Document } from "mongoose";

// export interface BookingDocument extends Document {
//   type: "corporate" | "retail" | "channel";

//   clientName: string;
//   traacsCode: string;
//   companyEmail: string;

//   // Corporate only
//   bookerEmail?: string;

//   // Retail / Channel
//   bookerName?: string;
//   paymentDetail?: string;
//   receiptFile?: string;

//   createdAt: Date;
//   updatedAt: Date;
// }

// const BookingSchema = new Schema<BookingDocument>(
//   {
//     type: { type: String, enum: ["corporate", "retail", "channel"], required: true },

//     clientName: { type: String, required: true },
//     traacsCode: { type: String, required: true },
//     companyEmail: { type: String, required: true },

//     bookerEmail: { type: String },

//     bookerName: { type: String },
//     paymentDetail: { type: String },
//     receiptFile: { type: String },
//   },
//   { timestamps: true }
// );

// export const Booking = model<BookingDocument>("Booking", BookingSchema);

// backend/model/TraacBooking.ts
import { Schema, model, Document } from "mongoose";

export interface BookingDocument extends Document {
  type: "corporate" | "retail" | "channel";

  // Personal Info (Step 1)
  fullName: string;
  email: string;
  phone: string;
  
  // Flight Details (Step 1)
  flightDate: string;
  flightTime: string;
  airlineFlightNumber: string;
  arrivalCity: string;
  numberOfPassengers: number;
  specialRequests?: string;

  // Booking Details (Step 2)
  clientName: string;
  traacsCode: string;
  companyEmail: string;
  bookerEmail?: string;
  bookerName?: string;
  
  // Retail / Channel
  paymentDetail?: string;
  receiptFile?: string;

  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<BookingDocument>(
  {
    type: { type: String, enum: ["corporate", "retail", "channel"], required: true },

    // Personal Info
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    
    // Flight Details
    flightDate: { type: String, required: true },
    flightTime: { type: String, required: true },
    airlineFlightNumber: { type: String, required: true },
    arrivalCity: { type: String, required: true },
    numberOfPassengers: { type: Number, required: true, default: 1 },
    specialRequests: { type: String },

    // Booking Details
    clientName: { type: String, required: true },
    traacsCode: { type: String, required: true },
    companyEmail: { type: String, required: true },
    bookerEmail: { type: String },
    bookerName: { type: String },
    
    // Retail / Channel
    paymentDetail: { type: String },
    receiptFile: { type: String },
  },
  { timestamps: true }
);

export const Booking = model<BookingDocument>("Booking", BookingSchema);