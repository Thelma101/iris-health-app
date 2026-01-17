'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NotificationsPanel from './NotificationsPanel';
import Logo from '@/components/ui/Logo';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const router = useRouter();

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('fieldAgentToken');
    localStorage.removeItem('userRole');
    router.push('/login');
  };

  return (
    <header className="w-full h-[65px] bg-white rounded-[3.969px] border border-[#d9d9d9] relative z-20 overflow-visible">
      <div className="h-full max-w-[1444px] mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo container (left) - matches Figma design 1:838 */}
        <div className="bg-white h-[46px] overflow-clip rounded-[4px] flex items-center">
          <Logo textSize="md" />
        </div>

        {/* Right cluster - notification + avatar */}
        <div className="flex items-center gap-[21px]">
          {/* Notification bell - circular button */}
          <button 
            aria-label="Notifications" 
            onClick={() => setNotifOpen(true)}
            className="size-8 grid place-items-center bg-[#f4f5f7] rounded-full border border-[#d9d9d9] cursor-pointer hover:bg-gray-200 transition-colors overflow-clip"
          >
            <Image src="/icons/notification-01.svg" alt="Notifications" width={20} height={20} />
          </button>

          {/* Avatar - navigates to Profile Page */}
          <button 
            className="cursor-pointer overflow-hidden rounded-full size-11 hover:ring-2 hover:ring-[#2c7be5] transition-all"
            aria-label="User profile"
            onClick={() => router.push('/dashboard/profile')}
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
