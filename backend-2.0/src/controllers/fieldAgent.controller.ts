import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import SuccessResponse, { generateToken } from '../middlewares/helper';
import { AuthRequest } from '../middlewares/authMiddleware';
import { NotFoundException } from '../exceptions/not-found-exeptions';
import { ERRORCODES } from '../exceptions/root';
import fieldAgentModel from '../models/fieldAgent.model';
import communityModel from '../models/community.model';
import patientModel from '../models/patient.model';

export const registerfieldAgent = asyncHandler(async (req: Request, res: Response): Promise<void> =>  {
  const {firstName, lastName, email, password } = req.body;
  const existing = await fieldAgentModel.findOne({ email });
  if (existing) {
    res.status(400).json({ message: 'Field Agent already exist.' });
    return;
  }
  const hashed = await bcrypt.hash(password, 10);
  const fieldAgent = await fieldAgentModel.create({ firstName, lastName,email, password: hashed });
  const token = generateToken({ id: fieldAgent?._id, role: 'fieldAgent' });
  new SuccessResponse('Field Agent registered successfully.', {
    token,
    fieldAgent: {
      id: fieldAgent._id,
      firstName: fieldAgent.firstName,
      lastName: fieldAgent.lastName,
      email: fieldAgent.email,
      role: "fieldAgent",
    },
  }).sendResponse(res);
});
export const loginfieldAgent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const fieldAgent = await fieldAgentModel.findOne({ email });
  if (!fieldAgent) {
    res.status(400).json({ message: 'Field Agent not found.' });
    return;
  }
  const valid = await bcrypt.compare(password, fieldAgent.password);
  if (!valid) {
    res.status(400).json({ message: 'Invalid credentials.' });
    return;
  }
  const token = generateToken({ id: fieldAgent._id, role: 'fieldAgent' });
  new SuccessResponse('Logged in successfully.', {
    token,
    fieldAgent: {
      id: fieldAgent._id,
      firstName: fieldAgent.firstName,
      lastName: fieldAgent.lastName,
      email: fieldAgent.email,
      role: "fieldAgent",
    },
  }).sendResponse(res);

});
export const getfieldAgentProfile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const fieldAgentId = req.user?.id;
  const fieldAgent = await fieldAgentModel.findById(fieldAgentId);

  if (!fieldAgent) {
    throw new NotFoundException('Field Agent not found', ERRORCODES.RESOURCE_NOT_FOUND);
  }
  const fieldAgentData = fieldAgent.toJSON() as Record<string, any>;
  delete fieldAgentData.password;
  new SuccessResponse('Profile fetched successfully.', { fieldAgent: fieldAgentData }).sendResponse(res);
});
export const getAllFieldAgents = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const agents = await fieldAgentModel
      .find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Field agents fetched successfully",
      total: agents.length,
      agents,
    });
  }
);
export const getFieldAgentById = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const agent = await fieldAgentModel
      .findById(id)
      .select("-password");

    if (!agent) {
      res.status(404).json({ message: "Field agent not found" });
      return;
    }

    res.status(200).json({
      message: "Field agent fetched successfully",
      agent,
    });
  }
);
export const updateFieldAgent = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { firstName, lastName } = req.body;

    const agent = await fieldAgentModel.findById(id);
    if (!agent) {
      res.status(404).json({ message: "Field agent not found" });
      return;
    }

    if (firstName) agent.firstName = firstName;
    if (lastName) agent.lastName = lastName;

    await agent.save();

    res.status(200).json({
      message: "Field agent updated successfully",
      agent: {
        id: agent._id,
        firstName: agent.firstName,
        lastName: agent.lastName,
        email: agent.email,
        role: "fieldAgent",
      },
    });
  }
);
export const deleteFieldAgent = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const agent = await fieldAgentModel.findById(id);
    if (!agent) {
      res.status(404).json({ message: "Field agent not found" });
      return;
    }

    await agent.deleteOne();

    res.status(200).json({
      message: "Field agent deleted successfully",
    });
  }
);
export const getFieldOfficerSummary = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {

    // 1️⃣ Get all communities with their field officers
    const communities = await communityModel.find()
      .populate("fieldOfficers", "firstName lastName")
      .lean();

    const result: any[] = [];

    // 2️⃣ Loop through communities
    for (const community of communities) {

      // Get all patients in this community
      const patients = await patientModel.find({ community: community._id })
        .select("firstName lastName")
        .lean();

      const patientNames = patients.map(
        (p) => `${p.firstName} ${p.lastName}`
      );

      // 3️⃣ Loop through each officer in this community
      for (const officer of community.fieldOfficers as any[]) {
        const officerId = officer._id.toString();

        // Check if already added (because an officer can belong to multiple communities)
        let existing = result.find((r) => r.id === officerId);

        if (!existing) {
          existing = {
            id: officerId,
            name: `${officer.firstName || ""} ${officer.lastName || ""}`.trim(),
            numberOfTests: 0,
            patients: []
          };
          result.push(existing);
        }

        // Add tests count from this community
        existing.numberOfTests += community.totalTestsConducted || 0;

        // Add patient names
        existing.patients.push(...patientNames);
      }
    }

    res.status(200).json({
      message: "Field officer summary fetched successfully",
      data: result
    });
  }
);


