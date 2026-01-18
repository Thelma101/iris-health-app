import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import adminModel from '../models/admin.model';
import SuccessResponse, { generateToken } from '../middlewares/helper';
import { AuthRequest } from '../middlewares/authMiddleware';
import { NotFoundException } from '../exceptions/not-found-exeptions';
import { ERRORCODES } from '../exceptions/root';
import Patient from '../models/patient.model';
import Community from '../models/community.model';

export const registerAdmin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;
  const existing = await adminModel.findOne({ email });
  if (existing) {
    res.status(400).json({ message: 'admin already exist.' });
    return;
  }
  const hashed = await bcrypt.hash(password, 10);
  const admin = await adminModel.create({ name, email, password: hashed });
  const token = generateToken({ id: admin?._id, role: 'admin' });
  new SuccessResponse('Admin registered successfully.', {
    token,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: "admin",
    },
  }).sendResponse(res);
});

export const loginAdmin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const admin = await adminModel.findOne({ email });
  if (!admin) {
    res.status(400).json({ message: 'admin not found.' });
    return;
  }
  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) {
    res.status(400).json({ message: 'Invalid credentials.' });
    return;
  }
  const token = generateToken({ id: admin._id, role: 'admin' });
  new SuccessResponse('Logged in successfully.', {
    token,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: "admin",
    },
  }).sendResponse(res);

});

export const getAdminProfile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const adminId = req.user?.id;
  const admin = await adminModel.findById(adminId);

  if (!admin) {
    throw new NotFoundException('admin not found', ERRORCODES.RESOURCE_NOT_FOUND);
  }
  const adminData = admin.toJSON() as Record<string, any>;
  delete adminData.password;
  new SuccessResponse('Profile fetched successfully.', { admin: adminData }).sendResponse(res);
});

export const getAllAdmins = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const admins = await adminModel.find().select('-password');
  new SuccessResponse('Admins fetched successfully.', { admins }).sendResponse(res);
});

export const getCasesPerCommunity = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const communities = await Community.find().select('name totalTestsConducted');
  const data = communities.map(c => ({
    community: c.name,
    cases: c.totalTestsConducted || 0
  }));
  new SuccessResponse('Cases per community fetched.', { data }).sendResponse(res);
});

export const getTestResultsSummary = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const patients = await Patient.find();
  const summary: Record<string, number> = {};
  
  patients.forEach(patient => {
    patient.testDetails?.forEach((test: any) => {
      const result = test.testResult || 'Unknown';
      summary[result] = (summary[result] || 0) + 1;
    });
  });
  
  const data = Object.entries(summary).map(([result, count]) => ({ result, count }));
  new SuccessResponse('Test results summary fetched.', { data }).sendResponse(res);
});

export const getDashboardStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const [communitiesCount, patientsCount, totalTests] = await Promise.all([
    Community.countDocuments(),
    Patient.countDocuments(),
    Patient.aggregate([{ $group: { _id: null, total: { $sum: '$numberOfTests' } } }])
  ]);
  
  const stats = {
    communities: communitiesCount,
    patients: patientsCount,
    tests: totalTests[0]?.total || 0,
    communitiesCovered: communitiesCount,
    lastTestDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  };
  
  new SuccessResponse('Dashboard stats fetched.', { stats }).sendResponse(res);
});