'use client';

import React, { useState } from 'react';

const imgCancel01 = 'https://www.figma.com/api/mcp/asset/87b79148-b7c5-4325-895c-97b8a6593f5c';
const imgArrowDown01 = 'https://www.figma.com/api/mcp/asset/8c2cc956-8042-45a0-a11b-ae6d177f6b20';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (userData: { name: string; email: string; role: string; password: string }) => void;
}

export default function AddUserModal({ isOpen, onClose, onAdd }: AddUserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Admin',
    password: '',
  });

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdd = () => {
    onAdd?.(formData);
    setFormData({ name: '', email: '', role: 'Admin', password: '' });
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-white/30 backdrop-blur-sm cursor-pointer" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-[10px] w-full max-w-[625px] pointer-events-auto shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-[#d9d9d9] h-[48px] flex items-center justify-between px-[22px]">
            <h2 className="text-[20px] font-medium text-[#212b36] font-poppins">Add New User</h2>
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
              <label className="text-[14px] font-medium text-[#637381] font-poppins">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Name"
                className="w-full h-[48px] px-[21px] border border-[#d9d9d9] rounded-[4px] text-[14px] font-poppins text-[#212b36] placeholder-[#d9d9d9] focus:outline-none focus:border-[#2c7be5] transition-colors"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-[6px]">
              <label className="text-[14px] font-medium text-[#637381] font-poppins">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Email"
                className="w-full h-[48px] px-[21px] border border-[#d9d9d9] rounded-[4px] text-[14px] font-poppins text-[#212b36] placeholder-[#d9d9d9] focus:outline-none focus:border-[#2c7be5] transition-colors"
              />
            </div>

            {/* Role Dropdown */}
            <div className="space-y-[6px]">
              <label className="text-[14px] font-medium text-[#637381] font-poppins">Role</label>
              <div className="relative">
                <select
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
              <label className="text-[14px] font-medium text-[#637381] font-poppins">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-[48px] px-[21px] border border-[#d9d9d9] rounded-[4px] text-[14px] font-poppins text-[#212b36] placeholder-[#d9d9d9] focus:outline-none focus:border-[#2c7be5] transition-colors"
              />
            </div>

            {/* Add User Button */}
            <button
              onClick={handleAdd}
              className="w-full h-[48px] bg-[#2c7be5] text-white rounded-[10px] text-[16px] font-medium font-inter hover:bg-[#1e5aa8] transition-colors"
            >
              Add User
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
