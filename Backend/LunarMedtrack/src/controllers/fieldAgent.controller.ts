import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import SuccessResponse, { generateToken } from '../middlewares/helper';
import { AuthRequest } from '../middlewares/authMiddleware';
import { NotFoundException } from '../exceptions/not-found-exeptions';
import { ERRORCODES } from '../exceptions/root';
import fieldAgentModel from '../models/fieldAgent.model';

export const registerfieldAgent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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

export const getAllFieldAgents = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const fieldAgents = await fieldAgentModel.find().select('-password');
  new SuccessResponse('Field agents fetched successfully.', { fieldAgents }).sendResponse(res);
});

export const getFieldAgentById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const fieldAgent = await fieldAgentModel.findById(id).select('-password');
  if (!fieldAgent) {
    throw new NotFoundException('Field Agent not found', ERRORCODES.RESOURCE_NOT_FOUND);
  }
  new SuccessResponse('Field agent fetched successfully.', { fieldAgent }).sendResponse(res);
});

export const updateFieldAgent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { firstName, lastName, email, status, password } = req.body;
  
  const fieldAgent = await fieldAgentModel.findById(id);
  if (!fieldAgent) {
    throw new NotFoundException('Field Agent not found', ERRORCODES.RESOURCE_NOT_FOUND);
  }

  if (firstName) fieldAgent.firstName = firstName;
  if (lastName) fieldAgent.lastName = lastName;
  if (email) fieldAgent.email = email;
  if (status) fieldAgent.status = status;
  if (password) fieldAgent.password = await bcrypt.hash(password, 10);

  await fieldAgent.save();
  
  const fieldAgentData = fieldAgent.toJSON() as Record<string, any>;
  delete fieldAgentData.password;
  new SuccessResponse('Field agent updated successfully.', { fieldAgent: fieldAgentData }).sendResponse(res);
});

export const deleteFieldAgent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const fieldAgent = await fieldAgentModel.findByIdAndDelete(id);
  if (!fieldAgent) {
    throw new NotFoundException('Field Agent not found', ERRORCODES.RESOURCE_NOT_FOUND);
  }
  new SuccessResponse('Field agent deleted successfully.', {}).sendResponse(res);
});