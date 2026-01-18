'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface ProfileData {
  name: string;
  email: string;
  address: string;
  role: string;
  createdAt?: string;
  profileImage?: string;
}

export default function ProfilePage() {
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
    role: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showChangePassword, setShowChangePassword] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const adminToken = localStorage.getItem('token');
      const fieldAgentToken = localStorage.getItem('fieldAgentToken');
      const userRole = localStorage.getItem('userRole');
      
      const token = adminToken || fieldAgentToken;
      const isAdmin = userRole === 'admin' || !!adminToken;
      const apiUrl = isAdmin 
        ? 'http://localhost:8080/api/admin/profile' 
        : 'http://localhost:8080/api/field-agent/profile';
      
      if (token) {
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          const userData = data.data?.admin || data.data?.fieldAgent || data.admin || data.fieldAgent;
          
          const actualRole = userData?.role || userRole || (isAdmin ? 'Admin' : 'Field Agent');
          const displayRole = actualRole.charAt(0).toUpperCase() + actualRole.slice(1).replace(/([A-Z])/g, ' $1').trim();
          
          const profileInfo: ProfileData = {
            name: userData?.name || 'User',
            email: userData?.email || '',
            address: userData?.address || '',
            role: displayRole,
            createdAt: userData?.createdAt,
            profileImage: userData?.profileImage,
          };
          setProfile(profileInfo);
          setFormData({
            name: profileInfo.name,
            email: profileInfo.email,
            address: profileInfo.address,
            role: profileInfo.role,
          });
          if (userData?.profileImage) {
            setProfileImage(userData.profileImage);
          }
        }
      }
    } catch {
      const userRole = localStorage.getItem('userRole') || 'admin';
      const displayRole = userRole.charAt(0).toUpperCase() + userRole.slice(1).replace(/([A-Z])/g, ' $1').replace(/-/g, ' ').trim();
      
      setProfile({
        name: 'User',
        email: '',
        address: '',
        role: displayRole,
      });
      setFormData({
        name: 'User',
        email: '',
        address: '',
        role: displayRole,
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
    localStorage.removeItem('token');
    localStorage.removeItem('fieldAgentToken');
    localStorage.removeItem('userRole');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#ecf4ff]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2c7be5]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ecf4ff] p-4 sm:p-6">
      {/* Header - PROFILE title */}
      <div 
        className="border-2 border-[#fff9e6] rounded-lg overflow-hidden px-4 sm:px-[17px] py-3 sm:py-4 mb-4 sm:mb-6"
        style={{
          backgroundImage: 'linear-gradient(172.45deg, rgba(255, 249, 230, 1) 3.64%, rgba(232, 241, 255, 1) 100.8%)',
        }}
      >
        <h1 className="text-[18px] sm:text-[20px] font-semibold text-[#212b36] font-poppins uppercase">
          Profile
        </h1>
      </div>

      {/* Profile Content Card - Full width */}
      <div className="bg-white rounded-[15px] shadow-sm p-4 sm:p-6 md:p-8 w-full">
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
            <div className="size-[80px] sm:size-[100px] rounded-full overflow-hidden mr-[-31px]">
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
              className="size-7 sm:size-8 rounded-full bg-[#f4f5f7] flex items-center justify-center cursor-pointer hover:bg-[#e8e9eb] transition-colors mr-[-31px] z-10"
              aria-label="Change profile photo"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-6 sm:h-6">
                <path d="M3 9C3 7.89543 3.89543 7 5 7H5.92963C6.59834 7 7.2228 6.6658 7.59373 6.1094L8.40627 4.8906C8.7772 4.3342 9.40166 4 10.0704 4H13.9296C14.5983 4 15.2228 4.3342 15.5937 4.8906L16.4063 6.1094C16.7772 6.6658 17.4017 7 18.0704 7H19C20.1046 7 21 7.89543 21 9V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V9Z" stroke="#637381" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="13" r="4" stroke="#637381" strokeWidth="1.5"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col gap-5 sm:gap-[26px] w-full max-w-[600px] mx-auto">
          {/* Name Field */}
          <div className="flex flex-col gap-[6px]">
            <label className="text-[13px] sm:text-[14px] text-[#637381] font-medium font-poppins">
              Name
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

          {/* Role Field */}
          <div className="flex flex-col gap-[6px]">
            <label className="text-[13px] sm:text-[14px] text-[#637381] font-medium font-poppins">
              Role
            </label>
            <div className="w-full h-[44px] sm:h-[48px] px-4 sm:px-[21px] border border-[#d9d9d9] rounded-[4px] flex items-center bg-[#f9fafb]">
              <span className="text-[13px] sm:text-[14px] font-poppins text-[#212b36]">{profile?.role}</span>
            </div>
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
                  onClick={() => setEditing(false)}
                  className="flex-1 h-[44px] sm:h-[48px] border border-[#d9d9d9] text-[#637381] rounded-[4px] text-[13px] sm:text-[14px] font-medium hover:bg-[#f4f5f7] transition-colors font-poppins"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 h-[44px] sm:h-[48px] bg-[#2c7be5] text-white rounded-[4px] text-[13px] sm:text-[14px] font-medium hover:bg-[#1e5aa8] transition-colors font-poppins"
                >
                  Save Changes
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
              logout
            </button>
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
