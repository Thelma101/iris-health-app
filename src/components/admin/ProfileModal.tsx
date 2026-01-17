'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import api from '@/lib/api';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

interface ProfileData {
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function ProfileModal({ isOpen, onClose, onLogout }: ProfileModalProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch('http://localhost:8080/api/admin/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          const adminData = data.data?.admin || data.admin;
          setProfile({
            name: adminData?.name || 'Admin User',
            email: adminData?.email || '',
            role: 'Administrator',
            createdAt: adminData?.createdAt,
          });
          setFormData({
            name: adminData?.name || '',
            email: adminData?.email || '',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // TODO: Implement profile update API
    setEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('fieldAgentToken');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm cursor-pointer" 
        onClick={onClose}
      />
      
      {/* Modal - Right aligned, slides from top */}
      <div className="relative w-full max-w-[400px] bg-white rounded-bl-[20px] shadow-xl mt-0 mr-0 overflow-hidden animate-slide-down">
        {/* Header with gradient */}
        <div 
          className="h-[120px] relative"
          style={{
            background: 'linear-gradient(135deg, #2c7be5 0%, #00ab9f 100%)',
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <Image src="/icons/cancel-01.svg" alt="Close" width={24} height={24} className="invert" />
          </button>
          
          {/* Profile Image - Positioned to overlap */}
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
              <Image 
                src="/icons/ellipse1.png" 
                alt="Profile" 
                width={96} 
                height={96}
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-16 pb-6 px-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2c7be5]"></div>
            </div>
          ) : (
            <>
              {/* Name and Role */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-[#212b36] font-poppins">
                  {profile?.name || 'Admin User'}
                </h2>
                <p className="text-sm text-[#637381] font-poppins">{profile?.role}</p>
              </div>

              {/* Profile Details */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-[#f4f5f7] rounded-lg">
                  <svg className="w-5 h-5 text-[#637381]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-xs text-[#637381] font-poppins">Email</p>
                    <p className="text-sm text-[#212b36] font-poppins">{profile?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-[#f4f5f7] rounded-lg">
                  <svg className="w-5 h-5 text-[#637381]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div>
                    <p className="text-xs text-[#637381] font-poppins">Role</p>
                    <p className="text-sm text-[#212b36] font-poppins">{profile?.role}</p>
                  </div>
                </div>

                {profile?.createdAt && (
                  <div className="flex items-center gap-3 p-3 bg-[#f4f5f7] rounded-lg">
                    <svg className="w-5 h-5 text-[#637381]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-xs text-[#637381] font-poppins">Member Since</p>
                      <p className="text-sm text-[#212b36] font-poppins">
                        {new Date(profile.createdAt).toLocaleDateString('en-GB', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/dashboard/profile'}
                  className="w-full h-12 rounded-[10px] bg-[#2c7be5] text-white font-medium font-inter hover:bg-[#1e5aa8] transition-colors"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full h-12 rounded-[10px] bg-white border border-red-500 text-red-500 font-medium font-inter hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
