import mongoose, { Schema, Document } from "mongoose";

export interface ITestType extends Document {
  name: string;
  results: string[];
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TestTypeSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Test type name is required"],
      unique: true,
      trim: true,
    },
    results: {
      type: [String],
      required: [true, "Expected results are required"],
      default: ["Positive", "Negative"],
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ITestType>("TestType", TestTypeSchema);
