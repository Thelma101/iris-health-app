'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { fieldAgentApi } from '@/lib/api/field-agent';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  createdAt?: string;
  profileImage?: string;
  communities?: string[];
  totalVisitations?: number;
}

export default function FieldAgentProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<string>('/icons/ellipse1.png');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fieldAgentApi.getProfile();
      const data = (res.data as any)?.data?.fieldAgent || 
                   (res.data as any)?.fieldAgent || 
                   res.data;
      
      const profileInfo: ProfileData = {
        name: data?.name || 'Field Agent',
        email: data?.email || '',
        phone: data?.phone || '',
        address: data?.address || '',
        role: 'Field Agent',
        createdAt: data?.createdAt,
        profileImage: data?.profileImage,
        communities: data?.communities || [],
        totalVisitations: data?.totalVisitations || 0,
      };
      
      setProfile(profileInfo);
      setFormData({
        name: profileInfo.name,
        email: profileInfo.email,
        phone: profileInfo.phone,
        address: profileInfo.address,
      });
      
      if (data?.profileImage) {
        setProfileImage(data.profileImage);
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
      
      // Demo data
      setProfile({
        name: 'Field Agent',
        email: 'agent@medtrack.com',
        phone: '08012345678',
        address: 'Lagos, Nigeria',
        role: 'Field Agent',
        communities: ['Bayeku', 'Igbogbo'],
        totalVisitations: 45,
      });
      setFormData({
        name: 'Field Agent',
        email: 'agent@medtrack.com',
        phone: '08012345678',
        address: 'Lagos, Nigeria',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        setProfileImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      await fieldAgentApi.updateProfile(formData);
      setProfile({
        ...profile!,
        ...formData,
      });
      setEditing(false);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile');
      // For demo, still update locally
      setProfile({
        ...profile!,
        ...formData,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      // API call to change password would go here
      setShowChangePassword(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Password changed successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('fieldAgentToken');
    localStorage.removeItem('fieldAgentData');
    localStorage.removeItem('userRole');
    router.push('/field-agent/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#d9d9d9] rounded-tl-[20px] rounded-bl-[20px] overflow-hidden min-h-screen">
      <div className="p-4 sm:p-6">
        {/* Page Title */}
        <div 
          className="h-[50px] rounded-lg border-2 border-[#fff9e6] flex items-center px-4 mb-6"
          style={{ 
            backgroundImage: 'linear-gradient(172.45deg, rgba(255, 249, 230, 1) 3.64%, rgba(232, 241, 255, 1) 100.8%)' 
          }}
        >
          <h1 className="font-poppins font-semibold text-xl text-[#212b36] uppercase">
            Profile
          </h1>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
            <button onClick={() => setError(null)} className="ml-auto">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Profile Content */}
        <div className="bg-white rounded-[15px] border border-[#d9d9d9] p-4 sm:p-6 md:p-8 max-w-[700px] mx-auto">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <div className="relative flex items-end pr-[31px]">
              <div className="size-[80px] sm:size-[100px] rounded-full overflow-hidden mr-[-31px] border-4 border-[#ecf4ff]">
                <Image 
                  src={profileImage}
                  alt="Profile" 
                  width={100} 
                  height={100}
                  className="object-cover size-full"
                  onError={() => setProfileImage('/icons/ellipse1.png')}
                />
              </div>
              <button 
                onClick={handleCameraClick}
                className="size-7 sm:size-8 rounded-full bg-[#2c7be5] flex items-center justify-center cursor-pointer hover:bg-[#1e5aa8] transition-colors mr-[-31px] z-10"
                aria-label="Change profile photo"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 9C3 7.89543 3.89543 7 5 7H5.92963C6.59834 7 7.2228 6.6658 7.59373 6.1094L8.40627 4.8906C8.7772 4.3342 9.40166 4 10.0704 4H13.9296C14.5983 4 15.2228 4.3342 15.5937 4.8906L16.4063 6.1094C16.7772 6.6658 17.4017 7 18.0704 7H19C20.1046 7 21 7.89543 21 9V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V9Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="1.5"/>
                </svg>
              </button>
            </div>
            <p className="mt-4 font-poppins font-medium text-lg text-[#212b36]">{profile?.name}</p>
            <span className="text-xs bg-[#e8f1ff] text-[#2c7be5] px-3 py-1 rounded-full font-poppins mt-1">
              {profile?.role}
            </span>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-4 mb-6 sm:mb-8">
            <div className="bg-[#f4f5f7] rounded-lg p-4 text-center">
              <p className="font-poppins font-semibold text-2xl text-[#2c7be5]">
                {profile?.communities?.length || 0}
              </p>
              <p className="font-poppins text-sm text-[#637381]">Communities</p>
            </div>
            <div className="bg-[#f4f5f7] rounded-lg p-4 text-center">
              <p className="font-poppins font-semibold text-2xl text-[#00c897]">
                {profile?.totalVisitations || 0}
              </p>
              <p className="font-poppins text-sm text-[#637381]">Total Tests</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-5 sm:gap-[26px]">
            {/* Name Field */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] sm:text-[14px] text-[#637381] font-medium font-poppins">
                Full Name
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-[44px] sm:h-[48px] px-4 sm:px-[21px] border border-[#d9d9d9] rounded-[4px] text-[13px] sm:text-[14px] font-poppins text-[#212b36] focus:outline-none focus:border-[#2c7be5] bg-white"
                />
              ) : (
                <div className="w-full h-[44px] sm:h-[48px] px-4 sm:px-[21px] border border-[#d9d9d9] rounded-[4px] flex items-center bg-white">
                  <span className="text-[13px] sm:text-[14px] font-poppins text-[#212b36]">{profile?.name}</span>
                </div>
              )}
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] sm:text-[14px] text-[#637381] font-medium font-poppins">
                Email
              </label>
              {editing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-[44px] sm:h-[48px] px-4 sm:px-[21px] border border-[#d9d9d9] rounded-[4px] text-[13px] sm:text-[14px] font-poppins text-[#212b36] focus:outline-none focus:border-[#2c7be5] bg-white"
                />
              ) : (
                <div className="w-full h-[44px] sm:h-[48px] px-4 sm:px-[21px] border border-[#d9d9d9] rounded-[4px] flex items-center bg-white">
                  <span className="text-[13px] sm:text-[14px] font-poppins text-[#212b36]">{profile?.email}</span>
                </div>
              )}
            </div>

            {/* Phone Field */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] sm:text-[14px] text-[#637381] font-medium font-poppins">
                Phone Number
              </label>
              {editing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-[44px] sm:h-[48px] px-4 sm:px-[21px] border border-[#d9d9d9] rounded-[4px] text-[13px] sm:text-[14px] font-poppins text-[#212b36] focus:outline-none focus:border-[#2c7be5] bg-white"
                />
              ) : (
                <div className="w-full h-[44px] sm:h-[48px] px-4 sm:px-[21px] border border-[#d9d9d9] rounded-[4px] flex items-center bg-white">
                  <span className="text-[13px] sm:text-[14px] font-poppins text-[#212b36]">{profile?.phone || '-'}</span>
                </div>
              )}
            </div>

            {/* Address Field */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] sm:text-[14px] text-[#637381] font-medium font-poppins">
                Address
              </label>
              {editing ? (
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full h-[44px] sm:h-[48px] px-4 sm:px-[21px] border border-[#d9d9d9] rounded-[4px] text-[13px] sm:text-[14px] font-poppins text-[#212b36] focus:outline-none focus:border-[#2c7be5] bg-white"
                />
              ) : (
                <div className="w-full h-[44px] sm:h-[48px] px-4 sm:px-[21px] border border-[#d9d9d9] rounded-[4px] flex items-center bg-white">
                  <span className="text-[13px] sm:text-[14px] font-poppins text-[#212b36]">{profile?.address || '-'}</span>
                </div>
              )}
            </div>

            {/* Role Field (Read-only) */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] sm:text-[14px] text-[#637381] font-medium font-poppins">
                Role
              </label>
              <div className="w-full h-[44px] sm:h-[48px] px-4 sm:px-[21px] border border-[#d9d9d9] rounded-[4px] flex items-center bg-[#f9fafb]">
                <span className="text-[13px] sm:text-[14px] font-poppins text-[#212b36]">{profile?.role}</span>
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] sm:text-[14px] text-[#637381] font-medium font-poppins">
                Password
              </label>
              <div className="w-full h-[44px] sm:h-[48px] px-4 sm:px-[21px] border border-[#d9d9d9] rounded-[4px] flex items-center justify-between bg-white">
                <span className="text-[13px] sm:text-[14px] font-poppins text-[#212b36]">**********************</span>
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="text-[12px] sm:text-[14px] font-poppins text-[#2c7be5] hover:text-[#1e5aa8] transition-colors whitespace-nowrap uppercase"
                >
                  CHANGE PASSWORD
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 sm:pt-[17px]">
              {editing ? (
                <div className="flex gap-3 sm:gap-4">
                  <button
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        name: profile?.name || '',
                        email: profile?.email || '',
                        phone: profile?.phone || '',
                        address: profile?.address || '',
                      });
                    }}
                    className="flex-1 h-[44px] sm:h-[48px] border border-[#d9d9d9] text-[#637381] rounded-[4px] text-[13px] sm:text-[14px] font-medium hover:bg-[#f4f5f7] transition-colors font-poppins"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 h-[44px] sm:h-[48px] bg-[#2c7be5] text-white rounded-[4px] text-[13px] sm:text-[14px] font-medium hover:bg-[#1e5aa8] transition-colors font-poppins disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="w-full h-[44px] sm:h-[48px] bg-[#2c7be5] text-white rounded-[4px] text-[13px] sm:text-[14px] font-medium hover:bg-[#1e5aa8] transition-colors font-poppins"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Logout Button */}
            <div className="flex items-center gap-[10px] mt-3 sm:mt-[17px]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="#D64545" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 17L15 12L10 7" stroke="#D64545" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 12H3" stroke="#D64545" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <button
                onClick={handleLogout}
                className="text-[13px] sm:text-[14px] font-poppins text-[#d64545] hover:text-[#b53a3a] transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
            onClick={() => setShowChangePassword(false)}
          />
          <div className="relative bg-white rounded-[15px] p-4 sm:p-6 w-full max-w-md shadow-xl">
            <h3 className="text-[16px] sm:text-[18px] font-semibold text-[#212b36] font-poppins mb-4 sm:mb-6">
              Change Password
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <label className="text-[13px] sm:text-[14px] text-[#637381] font-poppins">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full h-[40px] sm:h-[44px] px-4 border border-[#d9d9d9] rounded-lg text-[13px] sm:text-[14px] font-poppins text-[#212b36] focus:outline-none focus:border-[#2c7be5]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] sm:text-[14px] text-[#637381] font-poppins">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full h-[40px] sm:h-[44px] px-4 border border-[#d9d9d9] rounded-lg text-[13px] sm:text-[14px] font-poppins text-[#212b36] focus:outline-none focus:border-[#2c7be5]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] sm:text-[14px] text-[#637381] font-poppins">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full h-[40px] sm:h-[44px] px-4 border border-[#d9d9d9] rounded-lg text-[13px] sm:text-[14px] font-poppins text-[#212b36] focus:outline-none focus:border-[#2c7be5]"
                />
              </div>
              <div className="flex gap-3 sm:gap-4 pt-3 sm:pt-4">
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="flex-1 h-[40px] sm:h-[44px] border border-[#d9d9d9] text-[#637381] rounded-lg text-[13px] sm:text-[14px] font-medium hover:bg-[#f4f5f7] transition-colors font-poppins"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  className="flex-1 h-[40px] sm:h-[44px] bg-[#2c7be5] text-white rounded-lg text-[13px] sm:text-[14px] font-medium hover:bg-[#1e5aa8] transition-colors font-poppins"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
