import { Schema, model, Document } from "mongoose";

export interface AdminDocument extends Document {
  email: string;
  password: string;
}

const AdminSchema = new Schema<AdminDocument>({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }, 
});

export const Admin = model<AdminDocument>("Admin", AdminSchema);
