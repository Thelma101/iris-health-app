import { Schema, model, Document } from "mongoose";

export interface IAdmin extends Document {
  email: string;
  password: string;
  name?: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new Schema<IAdmin>({
  email: { type: String, required: true, lowercase: true, unique: true, index: true },
  password: { type: String, required: true },
  name: { type: String },
  status: { type: String, default: 'Active', enum: ['Active', 'Inactive'] }
}, { timestamps: true });

export default model<IAdmin>("Admin", AdminSchema);
