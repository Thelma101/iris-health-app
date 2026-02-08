import { Schema, model, Document } from "mongoose";

export interface ITestType extends Document {
  name: string;
  allowedResults: string[]; // must contain exactly 2 values
  createdAt: Date;
  updatedAt: Date;
}

const TestTypeSchema = new Schema<ITestType>(
  {
    name: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true 
    },
    allowedResults: {
      type: [String],
      required: true,
      validate: {
        validator: function (value: string[]) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "allowedResults must contain at least one value"
      }
    }
  },
  { timestamps: true }
);

export default model<ITestType>("TestType", TestTypeSchema);
