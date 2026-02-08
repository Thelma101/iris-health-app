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
  new SuccessResponse('Admin onboarded successfully.', {
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
export const updateAdminProfile = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const adminId = req.user?.id;
    const { name, password } = req.body;

    if (!name && !password) {
      res.status(400).json({ message: "Nothing to update" });
      return;
    }

    const admin = await adminModel.findById(adminId);
    if (!admin) {
      res.status(404).json({ message: "Admin not found" });
      return;
    }

    // Update name
    if (name) {
      admin.name = name;
    }

    // Update password (hashed)
    if (password) {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(password, salt);
    }

    await admin.save();

    res.status(200).json({
      message: "Profile updated successfully"
    });
  }
);
export const getAllAdmins = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const admins = await adminModel.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Admins fetched successfully",
      total: admins.length,
      admins,
    });
  }
);

// Update any admin by ID (for user management page)
export const updateAdmin = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, email, password } = req.body;

    const admin = await adminModel.findById(id);
    if (!admin) {
      res.status(404).json({ message: "Admin not found" });
      return;
    }

    // Update fields if provided
    if (name) admin.name = name;
    if (email) admin.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(password, salt);
    }

    await admin.save();

    const adminData = admin.toJSON() as Record<string, any>;
    delete adminData.password;

    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      admin: adminData,
    });
  }
);

// Delete admin by ID
export const deleteAdmin = asyncHandler(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    const admin = await adminModel.findById(id);
    if (!admin) {
      res.status(404).json({ message: "Admin not found" });
      return;
    }

    // Prevent self-deletion
    if (req.user?.id === id) {
      res.status(400).json({ message: "Cannot delete your own account" });
      return;
    }

    await adminModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Admin deleted successfully",
    });
  }
);

