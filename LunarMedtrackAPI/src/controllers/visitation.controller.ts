import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Visitation from "../models/visitation.model";
import Patient from "../models/patient.model";
import Community from "../models/community.model";
import { Types } from "mongoose";

/**
 * Create visitation record
 */
export const createVisitation = asyncHandler(async (req: Request, res: Response) => {
  const {
    patientId,
    communityId,
    visitDate,
    vitals,
    symptoms,
    diagnostics,
    treatments,
    notes
  } = req.body;

  // Must belong to at least patient or community
  if (!patientId && !communityId) {
    return res.status(400).json({
      message: "Visitation must be linked to a patient or a community"
    });
  }

  // Validate patient if provided
  if (patientId) {
    const patientExists = await Patient.findById(patientId);
    if (!patientExists) {
      return res.status(404).json({ message: "Patient not found" });
    }
  }

  // Validate community if provided
  if (communityId) {
    const communityExists = await Community.findById(communityId);
    if (!communityExists) {
      return res.status(404).json({ message: "Community not found" });
    }
  }

  const visitation = await Visitation.create({
    patientId: patientId ? new Types.ObjectId(patientId) : undefined,
    communityId: communityId ? new Types.ObjectId(communityId) : undefined,
    visitDate,
    vitals,
    symptoms,
    diagnostics,
    treatments,
    notes
  });

  const populatedVisitation = await visitation.populate([
    { path: "patientId", select: "firstName lastName phone" },
    { path: "communityId", select: "name lga" }
  ]);

  res.status(201).json({
    message: "Visitation recorded successfully",
    visitation: populatedVisitation
  });
});

/**
 * Get all visitations
 */
export const getAllVisitations = asyncHandler(async (_req: Request, res: Response) => {
  const visitations = await Visitation.find()
    .populate("patientId", "firstName lastName phone")
    .populate("communityId", "name lga")
    .sort({ visitDate: -1 });

  res.status(200).json({
    message: "Visitations fetched successfully",
    visitations
  });
});

/**
 * Get visitations for a patient
 */
export const getVisitationsByPatient = asyncHandler(async (req: Request, res: Response) => {
  const { patientId } = req.params;
 if (!Types.ObjectId.isValid(patientId)) {
    return res.status(400).json({ message: "Invalid patient ID format" });
  }

  // 2️⃣ Confirm patient exists
  const patientExists = await Patient.findById(patientId);
  if (!patientExists) {
    return res.status(404).json({ message: "Patient not found" });
  }
  const visitations = await Visitation.find({ patientId })
    .populate("communityId", "name lga")
    .sort({ visitDate: -1 });

  res.status(200).json({
    message: "Patient visitations fetched successfully",
    visitations
  });
});

/**
 * Get visitations for a community
 */
export const getVisitationsByCommunity = asyncHandler(async (req: Request, res: Response) => {
  const { communityId } = req.params;
 if (!Types.ObjectId.isValid(communityId)) {
    return res.status(400).json({ message: "Invalid community ID format" });
  }

  // 2️⃣ Confirm community exists
  const communityExists = await Community.findById(communityId);
  if (!communityExists) {
    return res.status(404).json({ message: "Community not found" });
  }
  const visitations = await Visitation.find({ communityId })
    // .populate("patientId", "firstName lastName phone")
    .sort({ visitDate: -1 });

  res.status(200).json({
    message: "Community visitations fetched successfully",
    visitations
  });
});

/**
 * Delete visitation
 */
export const deleteVisitation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const visitation = await Visitation.findById(id);
  if (!visitation) {
    return res.status(404).json({ message: "Visitation not found" });
  }

  await visitation.deleteOne();

  res.status(200).json({
    message: "Visitation deleted successfully"
  });
});
