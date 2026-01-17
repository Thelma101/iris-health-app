import { Schema, model, Document, Types } from "mongoose";

export interface ICommunity extends Document {
  name: string;
  lga: string; // local govt
  dateVisited?: Date;
  visitationSummary?: string;
  fieldOfficers: Types.ObjectId[]; // refs to Users
  totalPopulation?: number;
  totalTestsConducted?: number;
  createdAt: Date;
  updatedAt: Date;
}

const CommunitySchema = new Schema<ICommunity>({
  name: { type: String, required: true, index: true },
  lga: { type: String, required: true, index: true },
  dateVisited: { type: Date },
  visitationSummary: { type: String },
  fieldOfficers: [{ type: Schema.Types.ObjectId, ref: "FieldAgent" }],
  totalPopulation: { type: Number, default: 0 },
  totalTestsConducted: { type: Number, default: 0 }
}, { timestamps: true });

export default model<ICommunity>("Community", CommunitySchema);
