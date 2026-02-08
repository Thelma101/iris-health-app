import { Schema, model, Document, Types } from "mongoose";

export interface IInventory extends Document {
  itemName: string;
  category?: string;
  quantityAvailable: number;
  unit?: string;
  lowStockThreshold?: number;
  communityId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>({
  itemName: { type: String, required: true, index: true },
  category: { type: String },
  quantityAvailable: { type: Number, default: 0 },
  unit: { type: String },
  lowStockThreshold: { type: Number, default: 0 },
  communityId: { type: Schema.Types.ObjectId, ref: "Community", required: true, index: true }
}, { timestamps: true });

InventorySchema.index({ communityId: 1, itemName: 1 }, { unique: false });

export default model<IInventory>("Inventory", InventorySchema);
