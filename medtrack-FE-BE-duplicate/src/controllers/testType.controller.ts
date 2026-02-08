import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import testTypeModel from "../models/testType.model";
import { Types } from "mongoose";

export const createTestType = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { name, allowedResults } = req.body;

    if (!name || !allowedResults) {
      res.status(400).json({ message: "Name and allowedResults are required" });
      return;
    }

    if (!Array.isArray(allowedResults)) {
      res.status(400).json({
        message: "allowedResults must be an array"
      });
      return;
    }

    const existing = await testTypeModel.findOne({ name: name.trim() });
    if (existing) {
      res.status(400).json({ message: "Test type already exists" });
      return;
    }

    const testType = await testTypeModel.create({
      name: name.trim(),
      allowedResults
    });

    res.status(201).json({
      message: "Test type created successfully",
      testType
    });
  }
);

export const getAllTestTypes = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const testTypes = await testTypeModel.find().select("name allowedResults");

    res.status(200).json({
      message: "Test types fetched successfully",
      testTypes
    });
  }
);
export const getTestTypeById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const testType = await testTypeModel.findById(id);

    if (!testType) {
      res.status(404).json({ message: "Test type not found" });
      return;
    }

    res.status(200).json(testType);
  }
);
// Get allowedResults by test type ID
export const getAllowedResultsById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    // Validate the ID format
    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid test type ID format" });
      return;
    }

    // Find the test type with only the fields we need
    const testType = await testTypeModel.findById(id).select("name allowedResults");

    if (!testType) {
      res.status(404).json({ message: "Test type not found" });
      return;
    }

    res.status(200).json({
      message: "Allowed results fetched successfully",
      data: {
        testTypeId: testType._id,
        name: testType.name,
        allowedResults: testType.allowedResults
      }
    });
  }
);

// Update test type
export const updateTestType = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, allowedResults } = req.body;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid test type ID format" });
      return;
    }

    const testType = await testTypeModel.findById(id);
    if (!testType) {
      res.status(404).json({ message: "Test type not found" });
      return;
    }

    // Check if new name already exists (excluding current)
    if (name && name !== testType.name) {
      const existing = await testTypeModel.findOne({ 
        name: name.trim(),
        _id: { $ne: id }
      });
      if (existing) {
        res.status(400).json({ message: "Test type with this name already exists" });
        return;
      }
    }

    const updatedTestType = await testTypeModel.findByIdAndUpdate(
      id,
      { 
        ...(name && { name: name.trim() }),
        ...(allowedResults && { allowedResults })
      },
      { new: true }
    );

    res.status(200).json({
      message: "Test type updated successfully",
      testType: updatedTestType
    });
  }
);

// Delete test type
export const deleteTestType = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: "Invalid test type ID format" });
      return;
    }

    const testType = await testTypeModel.findByIdAndDelete(id);
    if (!testType) {
      res.status(404).json({ message: "Test type not found" });
      return;
    }

    res.status(200).json({
      message: "Test type deleted successfully"
    });
  }
);