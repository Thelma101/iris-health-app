import { Schema, model, Document, Types } from "mongoose";

export interface IVisitation extends Document {
  patientId?: Types.ObjectId; // optional if community visit
  communityId?: Types.ObjectId; // optional if patient-only visit
  visitDate: Date;
  vitals?: Record<string, any>; // e.g. { bp: "120/80", temp: 37.2 }
  symptoms?: string[];
  diagnostics?: string[];
  treatments?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VisitationSchema = new Schema<IVisitation>({
  patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
  communityId: { type: Schema.Types.ObjectId, ref: "Community" },
  visitDate: { type: Date, required: true },
  vitals: { type: Schema.Types.Mixed },
  symptoms: [{ type: String }],
  diagnostics: [{ type: String }],
  treatments: [{ type: String }],
  notes: { type: String }
}, { timestamps: true });

VisitationSchema.index({ patientId: 1, visitDate: -1 });

export default model<IVisitation>("Visitation", VisitationSchema);
