import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Types } from "mongoose";
import communityModel from '../models/community.model';
import Patient from '../models/patient.model';

export const createCommunity = asyncHandler(async (req: Request, res: Response): Promise<void> =>  {
    const { name, lga, dateVisited, visitationSummary, fieldOfficers, totalPopulation, totalTestsConducted } = req.body;
      if (!name || !lga) {
        res.status(400).json({ message: 'Community name and Local Government area is compulsory' });
        return;
    }
      // ✅ Validate field officers
    if (!Array.isArray(fieldOfficers) || fieldOfficers.length === 0) {
      res.status(400).json({
        message: "You must provide at least one field officer",
      });
      return;
    }
    const existing = await communityModel.findOne({ name, lga });
    if (existing) {
         res.status(400).json({ message: "Community with this name and LGA already exists." });
         return;
    }
    // Ensure fieldOfficers are valid ObjectIds
    const officers = fieldOfficers?.map((id: string) => new Types.ObjectId(id)) || [];

    let community = await communityModel.create({
        name,
        lga,
        dateVisited,
        visitationSummary,
        fieldOfficers: officers,
        totalPopulation: totalPopulation || 0,
        totalTestsConducted: totalTestsConducted || 0,
          topPositive: 0,
      topNegative: 0,
    });
    community = await community.populate("fieldOfficers", "firstName lastName email");
    res.status(201).json({ message: "Community created successfully", community });
});
// Get all communities
export const getAllCommunities = asyncHandler(async (req: Request, res: Response): Promise<void> =>  {
    // Populate only the name and email of field officers
    const communities = await communityModel.find()
        .populate("fieldOfficers", "firstName lastName email");

    res.status(200).json({ message: "Communities fetched successfully", communities });
});

// Get a single community by ID
export const getCommunityById =asyncHandler(async (req: Request, res: Response): Promise<void> =>   {
  const { id } = req.params;

  const community = await communityModel.findById(id)
    .populate("fieldOfficers", "firstName lastName email"); // Populate names

  if (!community) {
    res.status(404).json({ message: "Community not found" });
    return;
  }

  res.status(200).json({ message: "Community fetched successfully", community });
});

// Update a community
export const updateCommunity =asyncHandler(async (req: Request, res: Response): Promise<void> =>   {
  const { id } = req.params;
  const { name, lga, dateVisited, visitationSummary, fieldOfficers, totalPopulation, totalTestsConducted } = req.body;

  const community = await communityModel.findById(id);
  if (!community) {
     res.status(404).json({ message: "Community not found" });
     return;
  }

  if (name) community.name = name;
  if (lga) community.lga = lga;
  if (dateVisited) community.dateVisited = new Date(dateVisited);
  if (visitationSummary) community.visitationSummary = visitationSummary;
  if (fieldOfficers) community.fieldOfficers = fieldOfficers.map((id: string) => new Types.ObjectId(id));
  if (totalPopulation !== undefined) community.totalPopulation = totalPopulation;
  if (totalTestsConducted !== undefined) community.totalTestsConducted = totalTestsConducted;

  await community.save();

  res.status(200).json({ message: "Community updated successfully", community });
});

// Delete a community
export const deleteCommunity = asyncHandler(async (req: Request, res: Response): Promise<void> =>  {
  const { id } = req.params;

  const community = await communityModel.findById(id);
  if (!community) {
     res.status(404).json({ message: "Community not found" });
     return;
  }

  // Optional: detach field officers (if you want to update their references elsewhere)
  community.fieldOfficers = [];
  await community.save();

  // Delete community
  await community.deleteOne();

  res.status(200).json({ message: "Community deleted successfully" });
});

/**
 * Get all patients belonging to a specific community
 * Supports pagination via query params: page, limit
 */
export const getPatientsByCommunity = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: "Invalid community ID" });
    return;
  }

  const community = await communityModel.findById(id);
  if (!community) {
    res.status(404).json({ message: "Community not found" });
    return;
  }

  const { page, limit } = req.query;
  const pageNum = Math.max(1, parseInt(page as string) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit as string) || 50));
  const skip = (pageNum - 1) * pageSize;

  const [patients, total] = await Promise.all([
    Patient.find({ community: new Types.ObjectId(id) })
      .populate("community", "name lga")
      .populate("testDetails.testType", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize),
    Patient.countDocuments({ community: new Types.ObjectId(id) }),
  ]);

  res.status(200).json({
    message: "Patients fetched successfully",
    patients,
    community: { _id: community._id, name: community.name, lga: community.lga },
    pagination: {
      page: pageNum,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

export const getCommunityLga = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { communityId } = req.params;

    if (!Types.ObjectId.isValid(communityId)) {
      res.status(400).json({ message: "Invalid community ID" });
      return;
    }

    const community = await communityModel.findById(communityId, { lga: 1, name: 1 });
    if (!community) {
      res.status(404).json({ message: "Community not found" });
      return;
    }

    res.status(200).json({
      message: "LGA fetched successfully",
      community: {
        _id: community._id,
        name: community.name,
        lga: community.lga
      }
    });
  }
);

/**
 * Get statistics for a specific LGA
 * Query parameter: lga (e.g., /api/communities/stats/lga?lga=Badagry)
 */
export const getStatsByLga = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { lga } = req.query;

    if (!lga || typeof lga !== 'string') {
      res.status(400).json({ message: "LGA query parameter is required" });
      return;
    }

    // Case-insensitive search for the LGA
    const lgaRegex = new RegExp(`^${lga}$`, 'i');

    // Count communities in this LGA
    const communityCount = await communityModel.countDocuments({ lga: lgaRegex });

    // Get communities with their details
    const communities = await communityModel.find(
      { lga: lgaRegex },
      { name: 1, lga: 1, totalTestsConducted: 1, totalPopulation: 1, topPositive: 1, topNegative: 1 }
    );

    // Count patients in this LGA
    const patientCount = await Patient.countDocuments({ lga: lgaRegex });

    // Get total tests conducted for patients in this LGA
    const patients = await Patient.find(
      { lga: lgaRegex },
      { numberOfTests: 1, testDetails: 1 }
    );

    let totalTests = 0;
    patients.forEach(patient => {
      totalTests += patient.testDetails?.length || 0;
    });

    res.status(200).json({
      message: `Statistics for ${lga} LGA fetched successfully`,
      lga: lga,
      stats: {
        communities: communityCount,
        patients: patientCount,
        totalEntries: communityCount + patientCount,
        totalTestsConducted: totalTests
      },
      communities: communities
    });
  }
);
