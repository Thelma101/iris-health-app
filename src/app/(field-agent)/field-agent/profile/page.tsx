'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { fieldAgentApi } from '@/lib/api/field-agent';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProfileData {
  name: string;
  email: string;
  role: string;
  address: string;
}

export default function FieldAgentProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string>('/icons/ellipse1.png');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showChangePassword, setShowChangePassword] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fieldAgentApi.getProfile();
      const data = (res.data as any)?.data?.fieldAgent || 
                   (res.data as any)?.fieldAgent || 
                   res.data;
      
      const firstName = data?.firstName || '';
      const lastName = data?.lastName || '';
      const fullName = firstName && lastName 
        ? `${firstName} ${lastName}` 
        : data?.name || 'Field Agent';

      const profileInfo = {
        name: fullName,
        email: data?.email || '',
        role: 'Field Officer',
        address: data?.address || '',
      };
      
      setProfile(profileInfo);
      setFormData({
        name: profileInfo.name,
        email: profileInfo.email,
        address: profileInfo.address,
      });
      
      if (data?.profileImage) {
        setProfileImage(data.profileImage);
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setProfile({
        name: 'GreenLunar',
        email: 'Greenlunar@gmail.com',
        role: 'Field Officer',
        address: '',
      });
      setFormData({
        name: 'GreenLunar',
        email: 'Greenlunar@gmail.com',
        address: '',
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
    setProfile({
      ...profile!,
      ...formData,
    });
    setEditing(false);
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setShowChangePassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
    <div className="bg-white border border-[#d9d9d9] border-r-0 rounded-tl-[20px] rounded-bl-[20px] rounded-tr-none rounded-br-none overflow-hidden min-h-[calc(100vh-93px)]">
      <div className="p-4 sm:p-6">
        {/* Page Title */}
        <div 
          className="h-12 sm:h-[50px] rounded-lg border-2 border-[#fff9e6] flex items-center px-4 mb-6 sm:mb-8"
          style={{ 
            backgroundImage: 'linear-gradient(172.45deg, rgba(255, 249, 230, 1) 3.64%, rgba(232, 241, 255, 1) 100.8%)' 
          }}
        >
          <h1 className="font-poppins font-semibold text-lg sm:text-xl text-[#212b36] uppercase">
            Profile
          </h1>
        </div>

        {/* Profile Content */}
        <div className="flex flex-col gap-5 sm:gap-[26px] items-center max-w-[600px] mx-auto">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Avatar Section */}
          <div className="flex items-end pr-[31px]">
            <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] rounded-full overflow-hidden mr-[-31px] bg-[#e8f1ff]">
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
              className="size-7 sm:size-8 rounded-full bg-[#f4f5f7] flex items-center justify-center cursor-pointer hover:bg-[#e5e7eb] transition-colors mr-[-31px] z-10"
              aria-label="Change profile photo"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6">
                <path d="M3 9C3 7.89543 3.89543 7 5 7H5.92963C6.59834 7 7.2228 6.6658 7.59373 6.1094L8.40627 4.8906C8.7772 4.3342 9.40166 4 10.0704 4H13.9296C14.5983 4 15.2228 4.3342 15.5937 4.8906L16.4063 6.1094C16.7772 6.6658 17.4017 7 18.0704 7H19C20.1046 7 21 7.89543 21 9V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V9Z" stroke="#637381" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="13" r="4" stroke="#637381" strokeWidth="1.5"/>
              </svg>
            </button>
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-5 sm:gap-[26px] w-full">
            {/* Name Field */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] sm:text-[14px] text-[#637381] font-medium font-poppins">
                Name
              </label>
              <div className="w-full h-[44px] sm:h-[48px] px-4 sm:px-[21px] border border-[#d9d9d9] rounded-[4px] flex items-center bg-white">
                <span className="text-[13px] sm:text-[14px] font-poppins text-[#212b36]">{profile?.name}</span>
              </div>
            </div>

            {/* Role Field */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] sm:text-[14px] text-[#637381] font-medium font-poppins">
                Role
              </label>
              <div className="w-full h-[44px] sm:h-[48px] px-4 sm:px-[21px] border border-[#d9d9d9] rounded-[4px] flex items-center bg-white">
                <span className="text-[13px] sm:text-[14px] font-poppins text-[#212b36]">{profile?.role}</span>
              </div>
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] sm:text-[14px] text-[#637381] font-medium font-poppins">
                Email
              </label>
              <div className="w-full h-[44px] sm:h-[48px] px-4 sm:px-[21px] border border-[#d9d9d9] rounded-[4px] flex items-center bg-white">
                <span className="text-[13px] sm:text-[14px] font-poppins text-[#212b36]">{profile?.email}</span>
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-[13px] sm:text-[14px] text-[#637381] font-medium font-poppins">
                Password
              </label>
              <div className="w-full h-[44px] sm:h-[48px] px-4 sm:px-[21px] border border-[#d9d9d9] rounded-[4px] flex items-center bg-white">
                <span className="text-[13px] sm:text-[14px] font-poppins text-[#212b36]">**********************</span>
              </div>
            </div>

            {/* Action Buttons */}
            {/* <div className="pt-3 sm:pt-[17px]">
              {editing ? (
                <div className="flex gap-3 sm:gap-4">
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 h-[44px] sm:h-[48px] border border-[#d9d9d9] text-[#637381] rounded-[4px] text-[13px] sm:text-[14px] font-medium hover:bg-[#f4f5f7] transition-colors font-poppins cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 h-[44px] sm:h-[48px] bg-[#2c7be5] text-white rounded-[4px] text-[13px] sm:text-[14px] font-medium hover:bg-[#1e5aa8] transition-colors font-poppins cursor-pointer"
                  >
                    Update
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="w-full h-[44px] sm:h-[48px] bg-[#2c7be5] text-white rounded-[4px] text-[13px] sm:text-[14px] font-medium hover:bg-[#1e5aa8] transition-colors font-poppins cursor-pointer"
                >
                  Edit Profile
                </button>
              )}
            </div> */}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-[10px] mt-3 sm:mt-[17px] text-[#d64545] hover:text-[#b53a3a] transition-colors cursor-pointer"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 17L21 12M21 12L16 7M21 12H9M9 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[13px] sm:text-[14px] font-poppins">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {/* {showChangePassword && (
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
                  className="flex-1 h-[40px] sm:h-[44px] border border-[#d9d9d9] text-[#637381] rounded-lg text-[13px] sm:text-[14px] font-medium hover:bg-[#f4f5f7] transition-colors font-poppins cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  className="flex-1 h-[40px] sm:h-[44px] bg-[#2c7be5] text-white rounded-lg text-[13px] sm:text-[14px] font-medium hover:bg-[#1e5aa8] transition-colors font-poppins cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
