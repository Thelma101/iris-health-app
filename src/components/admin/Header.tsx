'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import NotificationsPanel from './NotificationsPanel';
import Logo from '@/components/ui/Logo';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  
  // Determine profile URL based on current path
  const isFieldAgent = pathname.startsWith('/dashboard/field-agent') || pathname.startsWith('/field-agent');
  const profileUrl = isFieldAgent ? '/field-agent/profile' : '/dashboard/profile';

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
    <header className="w-full h-[65px] bg-white rounded border border-[#d9d9d9] relative z-20 overflow-visible">
      <div className="h-full flex items-center justify-between">
        {/* Logo container (left) - positioned at far left per Figma */}
        <div className="absolute left-0 bg-white h-[46px] w-[244px] overflow-clip rounded flex items-center justify-center ml-6">
          <Logo textSize="md" />
        </div>

        {/* Right cluster - notification + avatar + mobile menu */}
        <div className="absolute right-[35px] flex items-center gap-[21px]">
          {/* Notification bell - circular button matching Figma exactly */}
          <button 
            aria-label="Notifications" 
            onClick={() => setNotifOpen(true)}
            className="relative size-8 flex items-center justify-center bg-[#f4f5f7] rounded-full border border-[#d9d9d9] cursor-pointer hover:bg-gray-200 transition-colors"
          >
            <Image src="/icons/notification-01.svg" alt="Notifications" width={24} height={24} />
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
              className="rounded-full object-cover"
            />
          </button>

          {/* Mobile hamburger menu */}
          <button 
            aria-label="Menu" 
            onClick={() => onMenuClick?.()} 
            className="lg:hidden size-8 grid place-items-center cursor-pointer hover:bg-gray-100 rounded-md transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
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
          
          {/* Panel positioned on the right - aligned with very top of page */}
          <div className="fixed top-0 right-0 z-50 w-full max-w-md h-screen" style={{ margin: 0 }}>
            <NotificationsPanel onClose={() => setNotifOpen(false)} />
          </div>
        </>
      )}

    </header>
  );
}
