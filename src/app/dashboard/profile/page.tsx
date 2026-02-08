'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

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
  const [profileImage, setProfileImage] = useState<string>('/icons/ellipse1.png');
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const adminToken = localStorage.getItem('token');
      const fieldAgentToken = localStorage.getItem('fieldAgentToken');
      const userRole = localStorage.getItem('userRole');

      const token = adminToken || fieldAgentToken;
      const isAdmin = userRole === 'admin' || !!adminToken;
      const apiUrl = isAdmin
        ? `${API_BASE_URL}/admin/profile`
        : `${API_BASE_URL}/fieldAgent/profile`;

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

  const handleChangePassword = () => {
    setIsEditingPassword(true);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  const handleSavePassword = async () => {
    if (!newPassword) {
      setPasswordError('Please enter a new password');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setSavingPassword(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('fieldAgentToken');
      const response = await fetch(
        `${API_BASE_URL}/admin/update`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password: newPassword }),
        }
      );

      if (response.ok) {
        setIsEditingPassword(false);
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
        alert('Password updated successfully');
      } else {
        const data = await response.json();
        setPasswordError(data.message || 'Failed to update password');
      }
    } catch {
      setPasswordError('Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleCancelPassword = () => {
    setIsEditingPassword(false);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminData');
    localStorage.removeItem('fieldAgentToken');
    localStorage.removeItem('fieldAgentData');
    localStorage.removeItem('userRole');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-65px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2c7be5]"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-93px)] relative rounded-tl-[20px] rounded-bl-[20px] rounded-tr-none rounded-br-none bg-white border border-[#d9d9d9] border-r-0 overflow-hidden">
      {/* Header - PROFILE title with gradient background - INSIDE the white card */}
      <div
        className="absolute top-[14px] left-[14px] sm:left-[27px] right-[14px] sm:right-[27px] rounded-lg overflow-hidden px-[14px] sm:px-[19px] py-[12px] sm:py-[15px] h-[50px] flex items-center"
        style={{
          background: 'linear-gradient(108.72deg, #FFF9E6 0%, #E8F1FF 100%)',
          border: '2px solid transparent',
        }}
      >
        <h1 className="text-[16px] sm:text-[20px] font-semibold text-[#212B36] font-poppins uppercase">
          Profile
        </h1>
      </div>

      {/* Profile Content - positioned below the header */}
      <div className="absolute top-[90px] sm:top-[112px] left-0 right-0 bottom-0 p-4 sm:p-8 md:px-[40px] lg:px-[100px] xl:px-[200px] overflow-y-auto">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        <div className="w-full max-w-[663px] mx-auto flex flex-col items-center gap-[26px]">
          {/* Avatar Section */}
          <div className="flex items-end">
            <div className="size-[100px] rounded-full overflow-hidden">
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
              className="size-8 rounded-[30px] bg-[#f4f5f7] flex items-center justify-center cursor-pointer hover:bg-[#e8e9eb] transition-colors ml-[-31px] z-10"
              aria-label="Change profile photo"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9C3 7.89543 3.89543 7 5 7H5.92963C6.59834 7 7.2228 6.6658 7.59373 6.1094L8.40627 4.8906C8.7772 4.3342 9.40166 4 10.0704 4H13.9296C14.5983 4 15.2228 4.3342 15.5937 4.8906L16.4063 6.1094C16.7772 6.6658 17.4017 7 18.0704 7H19C20.1046 7 21 7.89543 21 9V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V9Z" stroke="#637381" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="13" r="4" stroke="#637381" strokeWidth="1.5" />
              </svg>
            </button>
          </div>

          {/* Form Fields */}
          <div className="self-stretch flex flex-col items-start gap-[43px]">
            <div className="self-stretch flex flex-col items-start gap-[26px]">
              {/* Name Field */}
              <div className="self-stretch flex flex-col items-start gap-[6px]">
                <div className="self-stretch text-[14px] text-[#637381] font-medium font-poppins">
                  Name
                </div>
                <div className="self-stretch h-12 rounded-[4px] bg-white border border-[#d9d9d9] overflow-hidden relative">
                  <div className="absolute top-[13px] left-[22px] text-[14px] font-poppins text-[#212B36]">
                    {profile?.name || '-'}
                  </div>
                </div>
              </div>

              {/* Address Field */}
              <div className="self-stretch flex flex-col items-start gap-[6px]">
                <div className="self-stretch text-[14px] text-[#637381] font-medium font-poppins">
                  Address
                </div>
                <div className="self-stretch h-12 rounded-[4px] bg-white border border-[#d9d9d9] overflow-hidden relative">
                  <div className="absolute top-[13px] left-[22px] text-[14px] font-poppins text-[#212B36]">
                    {profile?.address || '-'}
                  </div>
                </div>
              </div>

              {/* Role Field */}
              <div className="self-stretch flex flex-col items-start gap-[6px]">
                <div className="self-stretch text-[14px] text-[#637381] font-medium font-poppins">
                  Role
                </div>
                <div className="self-stretch h-12 rounded-[4px] bg-white border border-[#d9d9d9] overflow-hidden relative">
                  <div className="absolute top-[13px] left-[22px] text-[14px] font-poppins text-[#212B36]">
                    {profile?.role || 'Owner'}
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div className="self-stretch flex flex-col items-start gap-[6px]">
                <div className="self-stretch text-[14px] text-[#637381] font-medium font-poppins">
                  Email
                </div>
                <div className="self-stretch h-12 rounded-[4px] bg-white border border-[#d9d9d9] overflow-hidden relative">
                  <div className="absolute top-[13px] left-[22px] text-[14px] font-poppins text-[#212B36]">
                    {profile?.email || '-'}
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div className="self-stretch flex flex-col items-start gap-[6px]">
                <div className="self-stretch text-[14px] text-[#637381] font-medium font-poppins">
                  Password
                </div>
                {isEditingPassword ? (
                  <div className="self-stretch flex flex-col gap-4">
                    <input
                      type="password"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full h-12 px-[22px] rounded-[4px] bg-white border border-[#d9d9d9] text-[14px] font-poppins text-[#212B36] focus:outline-none focus:border-[#2c7be5]"
                    />
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-12 px-[22px] rounded-[4px] bg-white border border-[#d9d9d9] text-[14px] font-poppins text-[#212B36] focus:outline-none focus:border-[#2c7be5]"
                    />
                    {passwordError && (
                      <p className="text-[12px] text-[#d64545] font-poppins">{passwordError}</p>
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={handleCancelPassword}
                        className="flex-1 h-10 border border-[#d9d9d9] text-[#637381] rounded-[4px] text-[14px] font-medium hover:bg-[#f4f5f7] transition-colors font-poppins"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSavePassword}
                        disabled={savingPassword}
                        className="flex-1 h-10 bg-[#2c7be5] text-white rounded-[4px] text-[14px] font-medium hover:bg-[#1e5aa8] transition-colors font-poppins disabled:opacity-50"
                      >
                        {savingPassword ? 'Saving...' : 'Save Password'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="self-stretch h-12 rounded-[4px] bg-white border border-[#d9d9d9] overflow-hidden relative flex items-center justify-between px-[22px]">
                    <div className="text-[14px] font-poppins text-[#212B36]">
                      **********************
                    </div>
                    <button
                      onClick={handleChangePassword}
                      className="text-[14px] font-poppins text-[#2c7be5] hover:text-[#1e5aa8] transition-colors uppercase"
                    >
                      CHANGE PASSWORD
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-[10px] text-[#d64545] hover:text-[#b53a3a] transition-colors cursor-pointer"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 17L21 12M21 12L16 7M21 12H9M9 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[14px] font-poppins">logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
