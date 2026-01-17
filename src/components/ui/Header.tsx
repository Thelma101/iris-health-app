'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import NotificationsPanel from './NotificationsPanel';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (notifOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [notifOpen]);

  return (
    <header className="w-full h-[65px] bg-white rounded-[3.969px] border border-[#d9d9d9] relative z-20 overflow-clip">
      <div className="h-full max-w-[1444px] mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo container (left) - matches Figma design 1:838 */}
        <div className="bg-white h-[46px] w-[244px] overflow-clip rounded-[4px] flex items-center justify-center gap-[11px]">
          <Image 
            src="/images/favicon.svg" 
            alt="Favicon" 
            width={24} 
            height={26} 
            className="w-[24px] h-[26px]"
          />
          <Image 
            src="/images/logo.svg" 
            alt="Logo" 
            width={153} 
            height={24} 
            className="h-6 w-auto"
          />
        </div>

        {/* Right cluster - notification + avatar */}
        <div className="flex items-center gap-[21px]">
          {/* Notification bell - circular button */}
          <button 
            aria-label="Notifications" 
            onClick={() => setNotifOpen(true)}
            className="size-8 grid place-items-center bg-[#f4f5f7] rounded-full border border-[#d9d9d9] cursor-pointer hover:bg-gray-200 transition-colors overflow-clip"
          >
            <Image src="/icons/notification-01.svg" alt="Notifications" width={24} height={24} />
          </button>

          {/* Avatar */}
          <button 
            className="cursor-pointer overflow-hidden rounded-full"
            aria-label="User profile"
          >
            <Image 
              src="/icons/ellipse1.png" 
              alt="User" 
              width={44} 
              height={44} 
              className="size-11 rounded-full hover:opacity-80 transition-opacity object-cover"
            />
          </button>

          {/* Mobile hamburger menu */}
          <button 
            aria-label="Menu" 
            onClick={() => onMenuClick?.()} 
            className="lg:hidden size-8 grid place-items-center cursor-pointer hover:bg-gray-100 rounded-md transition-colors"
          >
            <Image src="/icons/menu-01.svg" alt="Menu" width={20} height={20} />
          </button>
        </div>
      </div>

      {/* Notifications overlay */}
      {notifOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-[6px] z-40" 
            onClick={() => setNotifOpen(false)}
          />
          
          {/* Panel positioned on the right */}
          <div className="fixed top-20 right-2 sm:right-4 md:right-6 z-50 w-[calc(100%-16px)] sm:w-full max-w-md">
            <NotificationsPanel onClose={() => setNotifOpen(false)} />
          </div>
        </>
      )}
    </header>
  );
}
