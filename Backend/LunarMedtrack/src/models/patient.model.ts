import { Schema, model, Document, Types } from "mongoose";

export type Gender = "male" | "female";

export interface ITestDetail {
  testType: string;
  testResult: string;
  dateConducted: Date;
  officerNotes?: string;
  testSheetUrl?: string;    // or GridFS id
  patientImageUrl?: string; // or GridFS id
}

export interface IPatient extends Document {
  firstName: string;
  lastName: string;
  phone?: string;
  age?: number;
  gender?: Gender;
  community: Types.ObjectId; // ref Community
  lga?: string;
  numberOfTests: number;
  testDetails: ITestDetail[];
  createdAt: Date;
  updatedAt: Date;
}

const TestDetailSchema = new Schema<ITestDetail>({
  testType: { type: String, required: true },
  testResult: { type: String, required: true },
  dateConducted: { type: Date, required: true },
  officerNotes: { type: String },
  testSheetUrl: { type: String },
  patientImageUrl: { type: String }
}, { _id: false });

const PatientSchema = new Schema<IPatient>({
  firstName: { type: String, required: true, index: true },
  lastName: { type: String, required: true, index: true },
  phone: { type: String, index: true },
  age: { type: Number },
  gender: { type: String, enum: ["male", "female"] },
  community: { type: Schema.Types.ObjectId, ref: "Community", required: true, index: true },
  lga: { type: String }, // denormalized for fast queries
  numberOfTests: { type: Number, default: 0 },
  testDetails: [TestDetailSchema]
}, { timestamps: true });

// compound index to speed up queries by community + name
PatientSchema.index({ community: 1, lastName: 1, firstName: 1 });

export default model<IPatient>("Patient", PatientSchema);
