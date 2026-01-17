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

  const patient = await Patient.findById(id);
  if (!patient) {
    return res.status(404).json({ message: "Patient not found" });
  }

  // If new test is added
  if (updateData.testDetails?.length) {
    patient.testDetails.push(...updateData.testDetails);
    patient.numberOfTests = patient.testDetails.length;

    await Community.findByIdAndUpdate(patient.community, {
      $inc: { totalTestsConducted: updateData.testDetails.length }
    });
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
  await Community.findByIdAndUpdate(patient.community, {
    $inc: { totalTestsConducted: -patient.numberOfTests }
  });

  await patient.deleteOne();

  res.status(200).json({ message: "Patient deleted successfully" });
});
