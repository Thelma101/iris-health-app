'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { fieldAgentApi } from '@/lib/api/field-agent';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProfileData {
  name: string;
  email: string;
  role: string;
}

export default function FieldAgentProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string>('/icons/ellipse1.png');

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
      };
      
      setProfile(profileInfo);
      
      if (data?.profileImage) {
        setProfileImage(data.profileImage);
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setProfile({
        name: 'Field Agent',
        email: '',
        role: 'Field Officer',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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
          {/* Avatar Section */}
          <div className="flex items-center">
            <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] rounded-full overflow-hidden bg-[#e8f1ff]">
              <Image 
                src={profileImage}
                alt="Profile" 
                width={100} 
                height={100}
                className="object-cover size-full"
                onError={() => setProfileImage('/icons/ellipse1.png')}
              />
            </div>
          </div>

          {/* Form Fields - All Read Only */}
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
    </div>
  );
}
