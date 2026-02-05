import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import adminModel from '../models/admin.model';
import SuccessResponse, { generateToken } from '../middlewares/helper';
import { AuthRequest } from '../middlewares/authMiddleware';
import { NotFoundException } from '../exceptions/not-found-exeptions';
import { ERRORCODES } from '../exceptions/root';

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

export const getAllAdmins = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const admins = await adminModel.find().select('-password');
  new SuccessResponse('Admins fetched successfully.', { admins }).sendResponse(res);
});

// Self-update for logged-in admin (PATCH /admin/update)
export const updateAdminProfile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const adminId = req.user?.id;
  const { name, email, password } = req.body;

  const admin = await adminModel.findById(adminId);
  if (!admin) {
    throw new NotFoundException('Admin not found', ERRORCODES.RESOURCE_NOT_FOUND);
  }

  if (name) admin.name = name;
  if (email) admin.email = email;
  if (password) {
    admin.password = await bcrypt.hash(password, 10);
  }

  await admin.save();

  const adminData = admin.toJSON() as Record<string, any>;
  delete adminData.password;
  new SuccessResponse('Admin updated successfully.', { admin: adminData }).sendResponse(res);
});

// Update any admin by ID (PUT/PATCH /admin/:id)
export const updateAdmin = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, email, password, status } = req.body;

  const admin = await adminModel.findById(id);
  if (!admin) {
    throw new NotFoundException('Admin not found', ERRORCODES.RESOURCE_NOT_FOUND);
  }

  if (name) admin.name = name;
  if (email) admin.email = email;
  if (status) admin.status = status;
  if (password) {
    admin.password = await bcrypt.hash(password, 10);
  }

  await admin.save();

  const adminData = admin.toJSON() as Record<string, any>;
  delete adminData.password;
  new SuccessResponse('Admin updated successfully.', { admin: adminData }).sendResponse(res);
});

export const deleteAdmin = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const currentAdminId = req.user?.id;

  // Prevent self-deletion
  if (id === currentAdminId) {
    res.status(400).json({ message: 'Cannot delete your own account' });
    return;
  }

  const admin = await adminModel.findById(id);
  if (!admin) {
    throw new NotFoundException('Admin not found', ERRORCODES.RESOURCE_NOT_FOUND);
  }

  await admin.deleteOne();
  new SuccessResponse('Admin deleted successfully.', {}).sendResponse(res);
});