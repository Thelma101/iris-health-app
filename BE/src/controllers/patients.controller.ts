import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Patient from "../models/patient.model";
import Community from "../models/community.model";
import { Types } from "mongoose";

/**
 * Create patient (also records first test)
 */
export const createPatient = asyncHandler(async (req: Request, res: Response) => {
  const {
    firstName,
    lastName,
    phone,
    age,
    gender,
    community,
    lga,
    testDetails
  } = req.body;

  // Validate community
  const communityExists = await Community.findById(community);
  if (!communityExists) {
    return res.status(404).json({ message: "Community not found" });
  }

  // Create patient
  const patient = await Patient.create({
    firstName,
    lastName,
    phone,
    age,
    gender,
    community: new Types.ObjectId(community),
    lga: lga || communityExists.lga,
    testDetails,
    numberOfTests: testDetails?.length || 0
  });

  // Update community test count
  await Community.findByIdAndUpdate(community, {
    $inc: { totalTestsConducted: patient.numberOfTests }
  });

  const populatedPatient = await patient.populate("community", "name lga");

  res.status(201).json({
    message: "Patient and test record created successfully",
    patient: populatedPatient
  });
});
/**
 * Get all patients with their records
 */
export const getAllPatients = asyncHandler(async (_req: Request, res: Response) => {
  const patients = await Patient.find()
    .populate("community", "name lga")
    .sort({ createdAt: -1 });

  res.status(200).json({
    message: "Patients fetched successfully",
    patients
  });
});

/**
 * Get single patient with records
 */
export const getPatientById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const patient = await Patient.findById(id)
    .populate("community", "name lga");

  if (!patient) {
    return res.status(404).json({ message: "Patient not found" });
  }

  res.status(200).json({
    message: "Patient fetched successfully",
    patient
  });
});

/**
 * Update patient details or add new test
 */
export const updatePatient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const patient = await Patient.findById(id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // If testDetails is provided as a full array (for updating existing tests)
    if (updateData.testDetails && Array.isArray(updateData.testDetails)) {
      // Sanitize test details - only keep valid fields
      const sanitizedTests = updateData.testDetails.map((test: any) => ({
        testType: test.testType,
        testResult: test.testResult,
        dateConducted: test.dateConducted,
        officerNotes: test.officerNotes || test.officerNote || '',
        testSheetUrl: test.testSheetUrl || '',
        patientImageUrl: test.patientImageUrl || ''
      }));

      // Check if this is an update (same length) or adding new tests
      if (sanitizedTests.length === patient.testDetails.length) {
        // Update existing tests - replace the entire array
        patient.testDetails = sanitizedTests;
      } else if (sanitizedTests.length > patient.testDetails.length) {
        // New tests are being added - only add the new ones
        const newTests = sanitizedTests.slice(patient.testDetails.length);
        patient.testDetails.push(...newTests);
        patient.numberOfTests = patient.testDetails.length;

        if (patient.community) {
          await Community.findByIdAndUpdate(patient.community, {
            $inc: { totalTestsConducted: newTests.length }
          });
        }
      }
    }

    // Update patient bio data
    if (updateData.firstName) patient.firstName = updateData.firstName;
    if (updateData.lastName) patient.lastName = updateData.lastName;
    if (updateData.phone) patient.phone = updateData.phone;
    if (updateData.age) patient.age = updateData.age;
    if (updateData.gender) patient.gender = updateData.gender;

    await patient.save();

    const populatedPatient = await patient.populate("community", "name lga");

    res.status(200).json({
      message: "Patient updated successfully",
      patient: populatedPatient
    });
  } catch (error: any) {
    console.error('Error updating patient:', error);
    res.status(500).json({ 
      message: "Failed to update patient", 
      error: error.message || 'Unknown error'
    });
  }
});

/**
 * Delete patient and their records
 */
export const deletePatient = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const patient = await Patient.findById(id);
  if (!patient) {
    return res.status(404).json({ message: "Patient not found" });
  }

  // Decrease test count from community
  if (patient.community) {
    await Community.findByIdAndUpdate(patient.community, {
      $inc: { totalTestsConducted: -patient.numberOfTests }
    });
  }

  await patient.deleteOne();

  res.status(200).json({ message: "Patient deleted successfully" });
});
