import { Request, Response } from "express";
import TestType, { ITestType } from "../models/testType.model";

// Create a new test type
export const createTestType = async (req: Request, res: Response) => {
  try {
    const { name, results, description } = req.body;

    // Check if test type already exists
    const existingTestType = await TestType.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingTestType) {
      return res.status(400).json({
        success: false,
        message: "Test type with this name already exists",
      });
    }

    const testType = await TestType.create({
      name,
      results: results || ["Positive", "Negative"],
      description,
    });

    res.status(201).json({
      success: true,
      message: "Test type created successfully",
      data: { testType },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create test type",
    });
  }
};

// Get all test types
export const getAllTestTypes = async (req: Request, res: Response) => {
  try {
    const { active } = req.query;
    
    const filter: any = {};
    if (active === 'true') {
      filter.isActive = true;
    }

    const testTypes = await TestType.find(filter).sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: { testTypes },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch test types",
    });
  }
};

// Get test type by ID
export const getTestTypeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const testType = await TestType.findById(id);

    if (!testType) {
      return res.status(404).json({
        success: false,
        message: "Test type not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { testType },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch test type",
    });
  }
};

// Update test type
export const updateTestType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, results, description, isActive } = req.body;

    const testType = await TestType.findById(id);
    if (!testType) {
      return res.status(404).json({
        success: false,
        message: "Test type not found",
      });
    }

    // Check if new name already exists (excluding current)
    if (name && name !== testType.name) {
      const existingTestType = await TestType.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id }
      });
      if (existingTestType) {
        return res.status(400).json({
          success: false,
          message: "Test type with this name already exists",
        });
      }
    }

    const updatedTestType = await TestType.findByIdAndUpdate(
      id,
      { name, results, description, isActive },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Test type updated successfully",
      data: { testType: updatedTestType },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update test type",
    });
  }
};

// Delete test type
export const deleteTestType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const testType = await TestType.findByIdAndDelete(id);

    if (!testType) {
      return res.status(404).json({
        success: false,
        message: "Test type not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Test type deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete test type",
    });
  }
};

// Seed default test types (for initial setup)
export const seedTestTypes = async (req: Request, res: Response) => {
  try {
    const defaultTestTypes = [
      { name: "HIV 1/2 Rapid Test", results: ["Positive", "Negative", "Inconclusive"], description: "HIV screening test" },
      { name: "Malaria RDT", results: ["Positive", "Negative", "Invalid"], description: "Malaria rapid diagnostic test" },
      { name: "Hepatitis B", results: ["Reactive", "Non-Reactive", "Invalid"], description: "Hepatitis B surface antigen test" },
      { name: "Hepatitis C", results: ["Reactive", "Non-Reactive", "Invalid"], description: "Hepatitis C antibody test" },
      { name: "Typhoid", results: ["Positive", "Negative"], description: "Typhoid fever test" },
      { name: "Tuberculosis", results: ["Positive", "Negative", "Not Detected"], description: "TB sputum smear test" },
      { name: "Blood Pressure", results: ["Normal", "High", "Low", "Hypertension", "Prehypertension"], description: "Blood pressure measurement" },
      { name: "Blood Sugar", results: ["Normal", "High", "Low", "Diabetic", "Prediabetic"], description: "Blood glucose test" },
      { name: "Blood Glucose", results: ["Normal", "High", "Low", "Diabetic", "Prediabetic"], description: "Fasting blood glucose test" },
      { name: "Cholera Rapid Test", results: ["Positive", "Negative"], description: "Cholera rapid diagnostic test" },
    ];

    let created = 0;
    let skipped = 0;

    for (const testType of defaultTestTypes) {
      const existing = await TestType.findOne({ name: testType.name });
      if (!existing) {
        await TestType.create(testType);
        created++;
      } else {
        skipped++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Seeded test types: ${created} created, ${skipped} already existed`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to seed test types",
    });
  }
};
