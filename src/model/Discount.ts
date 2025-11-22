import { Schema, model, Document } from "mongoose";

export interface DiscountDocument extends Document {
  code: string;                 
  percentage: number;          
  createdBy?: string;           
  maxUsage: number;            
  usedCount: number;           
  isActive: boolean;            
  expiresAt?: Date;            
  createdAt: Date;
  updatedAt: Date;
}

const DiscountSchema = new Schema<DiscountDocument>(
  {
    code: { type: String, unique: true, required: true },
    percentage: { type: Number, default: 10 },

    createdBy: { type: String },

    maxUsage: { type: Number, default: 1 },  
    usedCount: { type: Number, default: 0 },

    isActive: { type: Boolean, default: true },

    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Discount = model<DiscountDocument>("Discount", DiscountSchema);
