'use client';

import { useState, useEffect } from 'react';

const imgCancel01 = 'https://www.figma.com/api/mcp/asset/732b6111-e5a5-477a-9038-f0f8bda0f47f';
const imgArrowDown01 = 'https://www.figma.com/api/mcp/asset/40e2a5d3-a4f5-49f0-9761-e7e4d2467d9e';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Field Officer' | 'Admin';
  password: string;
  lastLogin: string;
  status: 'Active' | 'Inactive';
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  onUpdate?: (userData: User) => void;
}

export default function EditUserModal({ isOpen, onClose, user, onUpdate }: Readonly<EditUserModalProps>) {
  const [formData, setFormData] = useState<User>({
    id: '',
    name: '',
    email: '',
    role: 'Admin',
    password: '',
    lastLogin: '',
    status: 'Active',
  });

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      [field]: field === 'role' ? value as 'Field Officer' | 'Admin' : value 
    }));
  };

  const handleUpdate = () => {
    onUpdate?.(formData);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <button 
        type="button"
        className="fixed inset-0 z-40 bg-white/30 backdrop-blur-sm cursor-pointer" 
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-[10px] w-full max-w-[625px] pointer-events-auto shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-[#d9d9d9] h-[48px] flex items-center justify-between px-[22px]">
            <h2 className="text-[20px] font-medium text-[#212b36] font-poppins">Edit User</h2>
            <button
              onClick={onClose}
              className="text-[#637381] hover:text-[#212b36] transition-colors"
            >
              <img src={imgCancel01} alt="Close" className="w-6 h-6" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-12 space-y-10">
            {/* Name Field */}
            <div className="space-y-[6px]">
              <label htmlFor="name" className="text-[14px] font-medium text-[#637381] font-poppins">Name</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full h-[48px] px-[21px] border border-[#d9d9d9] rounded-[4px] text-[14px] font-poppins text-[#212b36] focus:outline-none focus:border-[#2c7be5] transition-colors"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-[6px]">
              <label htmlFor="email" className="text-[14px] font-medium text-[#637381] font-poppins">Email</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full h-[48px] px-[21px] border border-[#d9d9d9] rounded-[4px] text-[14px] font-poppins text-[#212b36] focus:outline-none focus:border-[#2c7be5] transition-colors"
              />
            </div>

            {/* Role Dropdown */}
            <div className="space-y-[6px]">
              <label htmlFor="role" className="text-[14px] font-medium text-[#637381] font-poppins">Role</label>
              <div className="relative">
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full h-[48px] px-[21px] border border-[#d9d9d9] rounded-[4px] text-[14px] font-poppins text-[#212b36] appearance-none bg-white focus:outline-none focus:border-[#2c7be5] transition-colors"
                >
                  <option value="Admin">Admin</option>
                  <option value="Field Officer">Field Officer</option>
                </select>
                <img
                  src={imgArrowDown01}
                  alt="Dropdown"
                  className="absolute right-[12px] top-1/2 transform -translate-y-1/2 w-6 h-6 pointer-events-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-[6px]">
              <label htmlFor="password" className="text-[14px] font-medium text-[#637381] font-poppins">Password</label>
              <input
                id="password"
                type="text"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full h-[48px] px-[21px] border border-[#d9d9d9] rounded-[4px] text-[14px] font-poppins text-[#212b36] focus:outline-none focus:border-[#2c7be5] transition-colors"
              />
            </div>

            {/* Update Button */}
            <button
              onClick={handleUpdate}
              className="w-full h-[48px] bg-[#2c7be5] text-white rounded-[10px] text-[16px] font-medium font-inter hover:bg-[#1e5aa8] transition-colors"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
