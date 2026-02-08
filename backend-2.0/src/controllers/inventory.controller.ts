import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Community from "../models/community.model";
import { Types } from "mongoose";
import inventoryModel from "../models/inventory.model";

export const createInventoryItem =asyncHandler(async (req: Request, res: Response): Promise<void> =>  {
  const {
    itemName,
    category,
    quantityAvailable,
    unit,
    lowStockThreshold,
    communityId
  } = req.body;

  if (!Types.ObjectId.isValid(communityId)) {
     res.status(400).json({ message: "Invalid community ID" });
  }

  const communityExists = await Community.findById(communityId);
  if (!communityExists) {
     res.status(404).json({ message: "Community not found" });
  }

  const existingItem = await inventoryModel.findOne({
    itemName,
    communityId
  });

  if (existingItem) {
     res.status(409).json({
      message: "Inventory item already exists for this community"
    });
     return;
  }

  const inventory = await inventoryModel.create({
    itemName,
    category,
    quantityAvailable,
    unit,
    lowStockThreshold,
    communityId
  });

  res.status(201).json({
    message: "Inventory item created successfully",
    inventory
  });
});
export const getAllInventoryItems =asyncHandler(async (req: Request, res: Response): Promise<void> =>  {
  const { communityId } = req.query;

  const filter: any = {};

  if (communityId) {
    if (!Types.ObjectId.isValid(String(communityId))) {
       res.status(400).json({ message: "Invalid community ID" });
    }
    filter.communityId = communityId;
  }

  const inventory = await inventoryModel.find(filter)
    .populate("communityId", "name lga")
    .sort({ createdAt: -1 });

  res.status(200).json({
    message: "Inventory fetched successfully",
    inventory
  });
});

export const getInventoryItemById =asyncHandler(async (req: Request, res: Response): Promise<void> =>  {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
     res.status(400).json({ message: "Invalid inventory ID" });
  }

  const inventory = await inventoryModel.findById(id)
    .populate("communityId", "name lga");

  if (!inventory) {
     res.status(404).json({ message: "Inventory item not found" });
      return;
  }

  res.status(200).json({
    message: "Inventory item fetched successfully",
    inventory
  });
});

export const updateInventoryItem =asyncHandler(async (req: Request, res: Response): Promise<void> =>  {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
     res.status(400).json({ message: "Invalid inventory ID" });
  }

  const inventory = await inventoryModel.findById(id);

  if (!inventory) {
     res.status(404).json({ message: "Inventory item not found" });
      return;
  }

  Object.assign(inventory, req.body);
  await inventory.save();

  res.status(200).json({
    message: "Inventory item updated successfully",
    inventory
  });
});

export const deleteInventoryItem =asyncHandler(async (req: Request, res: Response): Promise<void> =>  {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
     res.status(400).json({ message: "Invalid inventory ID" });
  }

  const inventory = await inventoryModel.findById(id);

  if (!inventory) {
     res.status(404).json({ message: "Inventory item not found" });
      return;
  }

  await inventory.deleteOne();

  res.status(200).json({
    message: "Inventory item deleted successfully"
  });
});

