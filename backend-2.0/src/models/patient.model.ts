import { Schema, model, Document, Types } from "mongoose";

export type Gender = "male" | "female";

export interface ITestDetail {
  testType: Types.ObjectId;
  testResult: string;
  dateConducted: Date;
  officerNotes?: string;
  testSheetUrl?: string;    // or GridFS id
  patientImageUrl?: string; // or GridFS id
  conductedBy?: Types.ObjectId; // ref FieldAgent - who conducted this test
  // Health metrics
  heightCm?: number;
  weightKg?: number;
  bmi?: number;
  bmiCategory?: string; // Underweight | Normal | Overweight | Obese
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  bpCategory?: string; // Normal | Elevated | High (Stage 1) | High (Stage 2) | Crisis
  glucoseLevel?: number;
  glucoseUnit?: string; // mg/dL or mmol/L
}

export interface IEditRecord {
  editedBy: Types.ObjectId;  // Admin who made the edit
  editedAt: Date;
  action: string;  // e.g. 'update_patient', 'update_test', 'add_test'
  changes?: string; // summary of what changed
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
  createdBy?: Types.ObjectId; // Admin who created this patient record
  editHistory: IEditRecord[];
  createdAt: Date;
  updatedAt: Date;
}

const TestDetailSchema = new Schema<ITestDetail>({
  testType: {
    type: Schema.Types.ObjectId,
    ref: "TestType",
    required: true
  },
  testResult: { type: String },
  dateConducted: { type: Date, required: true },
  officerNotes: { type: String },
  testSheetUrl: { type: String },
  patientImageUrl: { type: String },
  conductedBy: {
    type: Schema.Types.ObjectId,
    ref: "Admin",
    index: true
  },
  // Health metrics
  heightCm: { type: Number },
  weightKg: { type: Number },
  bmi: { type: Number },
  bmiCategory: { type: String },
  bloodPressureSystolic: { type: Number },
  bloodPressureDiastolic: { type: Number },
  bpCategory: { type: String },
  glucoseLevel: { type: Number },
  glucoseUnit: { type: String, enum: ["mg/dL", "mmol/L"], default: "mg/dL" },
})

const EditRecordSchema = new Schema<IEditRecord>({
  editedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  editedAt: { type: Date, default: Date.now },
  action: { type: String },
  changes: { type: String },
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
  testDetails: [TestDetailSchema],
  createdBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  editHistory: [EditRecordSchema],
}, { timestamps: true });

// compound index to speed up queries by community + name
PatientSchema.index({ community: 1, lastName: 1, firstName: 1 });

export default model<IPatient>("Patient", PatientSchema);
