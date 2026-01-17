import { Schema, model, Document } from "mongoose";

export interface IFieldAgent extends Document {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status: 'Active' | 'Inactive';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FieldAgentSchema = new Schema<IFieldAgent>({
  email: { type: String, required: true, lowercase: true, unique: true, index: true },
  password: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  phone: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  lastLogin: { type: Date }
}, { timestamps: true });

export default model<IFieldAgent>("FieldAgent", FieldAgentSchema);
