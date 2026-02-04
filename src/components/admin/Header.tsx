'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import NotificationsPanel from './NotificationsPanel';
import api from '@/lib/api';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // Determine profile URL based on current path
  const isFieldAgent = pathname.startsWith('/dashboard/field-agent') || pathname.startsWith('/field-agent');
  const profileUrl = isFieldAgent ? '/field-agent/profile' : '/dashboard/profile';

  // Check for unread notifications on mount
  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const res = await api.getVisitations() as any;
        const visitations = res.data?.visitations || res.data?.data?.visitations || [];
        // Mark as unread if there are any visitations in the last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentVisits = visitations.filter((v: any) =>
          v.createdAt && new Date(v.createdAt) > oneDayAgo
        );
        setHasUnread(recentVisits.length > 0);
      } catch (err) {
        // Silently fail
      }
    };
    checkNotifications();
  }, []);

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
    <header className="w-full h-[65px] bg-white rounded-[4px] border border-[#d9d9d9] relative z-20 overflow-clip">
      <div className="h-full flex items-center justify-between">
        {/* Logo container (left) - MedTrack branding */}
        {/* Desktop: Full logo with container */}
        <div className="hidden lg:flex bg-white rounded-[4px] w-[244px] h-[46px] overflow-hidden items-center justify-center ml-[35px]">
          <div className="flex items-center gap-[11px]">
            <Image
              src="/images/medtrack-icon.svg"
              alt="MedTrack Icon"
              width={24}
              height={26}
              className="w-[23.9px] h-[25.8px]"
            />
            <Image
              src="/images/medtrack-text.svg"
              alt="MedTrack"
              width={153}
              height={24}
              className="w-[153.1px] h-[23.6px]"
            />
          </div>
        </div>
        {/* Mobile: Compact logo (130x18px per Figma) */}
        <div className="lg:hidden flex items-center gap-[6px] ml-[16px]">
          <Image
            src="/images/medtrack-icon.svg"
            alt="MedTrack Icon"
            width={16}
            height={18}
            className="w-[16px] h-[18px]"
          />
          <Image
            src="/images/medtrack-text.svg"
            alt="MedTrack"
            width={100}
            height={16}
            className="w-[100px] h-[16px]"
          />
        </div>

        {/* Right cluster - notification + avatar + mobile menu */}
        <div className="flex items-center gap-[12px] lg:gap-[21px] mr-[16px] lg:mr-[35px]">
          {/* Notification bell - circular button matching Figma exactly */}
          <button
            aria-label="Notifications"
            onClick={() => {
              setNotifOpen(true);
              setHasUnread(false);
            }}
            className="relative size-8 flex items-center justify-center bg-[#f4f5f7] border border-[#d9d9d9] rounded-[20px] cursor-pointer hover:bg-gray-200 transition-colors overflow-clip"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.35419 21C10.0593 21.6224 10.9856 22 12 22C13.0144 22 13.9407 21.6224 14.6458 21M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 11.0902 5.22047 13.206 4.34966 14.6054C3.61513 15.7859 3.24786 16.3761 3.26132 16.5408C3.27624 16.7231 3.31486 16.7926 3.46178 16.9016C3.59446 17 4.19259 17 5.38885 17H18.6112C19.8074 17 20.4056 17 20.5382 16.9016C20.6851 16.7926 20.7238 16.7231 20.7387 16.5408C20.7521 16.3761 20.3849 15.7859 19.6503 14.6054C18.7795 13.206 18 11.0902 18 8Z" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {/* Red notification badge */}
            {hasUnread && (
              <span className="absolute -top-0.5 -right-0.5 size-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </button>

          {/* Avatar - Profile icon (navigates to profile) */}
          <button
            onClick={() => router.push(profileUrl)}
            className="cursor-pointer overflow-hidden rounded-full size-11 hover:ring-2 hover:ring-blue-300 transition-all"
            aria-label="User profile"
          >
            <Image
              src="/icons/ellipse1.png"
              alt="Profile"
              width={44}
              height={44}
              className="rounded-full object-cover size-[44px]"
            />
          </button>

          {/* Mobile hamburger menu */}
          <button
            aria-label="Menu"
            onClick={() => onMenuClick?.()}
            className="lg:hidden size-8 grid place-items-center cursor-pointer hover:bg-gray-100 rounded-md transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Notifications overlay */}
      {notifOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-[6px] z-[9998]"
            onClick={() => setNotifOpen(false)}
          />

          {/* Panel positioned on the right */}
          <div className="fixed top-0 right-0 z-[9999] w-full max-w-md h-screen" style={{ margin: 0 }}>
            <NotificationsPanel onClose={() => setNotifOpen(false)} />
          </div>
        </>
      )}

    </header>
  );
}
