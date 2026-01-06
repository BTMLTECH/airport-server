import { Schema, model, Document } from "mongoose";

// ----------------------------
// Interface
// ----------------------------
export interface FeedbackDocument extends Document {
  fullName: string;        
  airlineName: string;   
  tripDate?: string;  

  serviceType: "arrival" | "departure";

  // Arrival fields
  meetingLocation?: string;
  luggageNo?: string;
  arrivalComment?: string;
  arrivalRating?: string;
  departureComment?: string;
  departureRating?: string;

  // Departure fields
  protocolOfficerMeet?: "yes" | "no";
  immigrationAssistance?: "yes" | "no";
  meetInOrOutside?: "inside" | "outside";

  companyName: string;

  createdAt: Date;
  updatedAt: Date;
}

// ----------------------------
// Schema
// ----------------------------
const FeedbackSchema = new Schema<FeedbackDocument>(
  {
    fullName: { type: String, required: true },        
    airlineName: { type: String, required: true },    
    tripDate: { type: String, required: true }, 
    serviceType: { type: String, enum: ["arrival", "departure"], required: true },

    // Arrival
    meetingLocation: { type: String, default: undefined },
    luggageNo: { type: String, default: undefined },
    arrivalComment: { type: String, default: undefined },
    arrivalRating: { type: String, default: undefined },

    // Departure
    protocolOfficerMeet: { type: String, enum: ["yes", "no"], default: undefined },
    immigrationAssistance: { type: String, enum: ["yes", "no"], default: undefined },
    meetInOrOutside: { type: String, enum: ["inside", "outside"], default: undefined },
    departureComment: { type: String, default: undefined },
    departureRating: { type: String, default: undefined },

    companyName: { type: String, default: "BTM Airport Services Feedback" },
  },
  { timestamps: true }
);

// ----------------------------
// Model
// ----------------------------
export const Feedback = model<FeedbackDocument>("Feedback", FeedbackSchema);
