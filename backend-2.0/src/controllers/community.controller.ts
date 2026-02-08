import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { Types } from "mongoose";
import communityModel from '../models/community.model';

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
