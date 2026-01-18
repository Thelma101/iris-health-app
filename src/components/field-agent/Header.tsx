'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function FieldAgentHeader({ onMenuClick }: HeaderProps) {
  const [agentName, setAgentName] = useState('Field Agent');
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get agent data from localStorage
    const agentData = localStorage.getItem('fieldAgentData');
    if (agentData) {
      try {
        const data = JSON.parse(agentData);
        setAgentName(`${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Field Agent');
      } catch (err) {
        console.error('Error parsing agent data:', err);
      }
    }
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white border border-[#d9d9d9] rounded-[4px] mx-4 mt-4 lg:mx-0 lg:mt-0 lg:rounded-none">
      <div className="h-[65px] px-4 lg:px-8 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-[#637381] hover:text-[#212b36]"
          aria-label="Open menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Logo (desktop) */}
        <div className="hidden lg:flex items-center gap-3 bg-white h-[46px] px-4 rounded">
          <Image
            src="/images/favicon.svg"
            alt="MedTrack"
            width={24}
            height={26}
            className="w-6 h-[26px]"
            loading="eager"
          />
          <Image
            src="/images/logo.svg"
            alt="MedTrack"
            width={153}
            height={24}
            className="h-6 w-auto"
            loading="eager"
            style={{ width: 'auto', height: '24px' }}
          />
        </div>

        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-2">
          <Image
            src="/images/favicon.svg"
            alt="MedTrack"
            width={20}
            height={22}
            className="w-5 h-[22px]"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 lg:gap-5">
          {/* Notification Bell */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-8 h-8 flex items-center justify-center bg-[#f4f5f7] rounded-full border border-[#d9d9d9] hover:bg-gray-200 transition-colors"
            aria-label="Notifications"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.35419 21C10.0593 21.6224 10.9856 22 12 22C13.0145 22 13.9407 21.6224 14.6458 21M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 11.0902 5.22047 13.206 4.34966 14.6054C3.61513 15.7859 3.24786 16.3761 3.26132 16.5408C3.27624 16.7231 3.31486 16.7926 3.46178 16.9016C3.59446 17 4.19259 17 5.38885 17H18.6112C19.8074 17 20.4056 17 20.5382 16.9016C20.6852 16.7926 20.7238 16.7231 20.7387 16.5408C20.7522 16.3761 20.3849 15.7859 19.6503 14.6054C18.7795 13.206 18 11.0902 18 8Z" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {/* Notification dot */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#d64545] rounded-full"></span>
          </button>

          {/* User Avatar */}
          <button
            onClick={() => router.push('/field-agent/profile')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-[#2c7be5] flex items-center justify-center text-white font-poppins font-medium">
              {agentName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:block font-poppins text-sm text-[#212b36]">
              {agentName}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
