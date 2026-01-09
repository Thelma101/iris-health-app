'use client';
import Image from 'next/image';
import Link from 'next/link';
import Icon, { IconName } from './Icon';
import { useState, useEffect } from 'react';
import NotificationsPanel from './NotificationsPanel';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [open, setOpen] = useState(false);
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

  const items: ReadonlyArray<{ readonly label: string; readonly href: string; readonly iconName: IconName }> = [
    { label: 'Dashboard', href: '/dashboard', iconName: 'dashboard' },
    { label: 'Community', href: '/dashboard/community', iconName: 'community' },
    { label: 'Test Recording', href: '/dashboard/tests', iconName: 'test' },
    { label: 'Patients', href: '/dashboard/patients', iconName: 'patients' },
    { label: 'Analytics & Reports', href: '/dashboard/reports', iconName: 'analytics' },
    { label: 'Users', href: '/dashboard/users', iconName: 'users' },
    { label: 'Profile', href: '/dashboard/profile', iconName: 'profile' },
  ];
  return (
    <header className="w-full h-16 bg-white rounded-sm border border-zinc-300 relative z-20">
      <div className="h-full max-w-[1444px] mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Gradient logo bar (left) */}
        <div className="h-11 flex items-center gap-2">
          <Image src="/favicon.svg" alt="Favicon" width={20} height={20} />
          <Image src="/logo.svg" alt="Logo" width={20} height={20} className="h-6 w-auto" />
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-5">
          {/* Notification bell */}
          <button 
            aria-label="Notifications" 
            onClick={() => setNotifOpen(true)}
            className="size-8 grid place-items-center bg-gray-100 rounded-[20px] shadow-[0_0_0_1px] shadow-zinc-300 cursor-pointer hover:bg-gray-200 transition-colors"
          >
            <Image src="/icons/notification-01.svg" alt="Notifications" width={20} height={20} />
          </button>

          {/* Avatar */}
          <Link href="/dashboard/profile" aria-label="Profile" className="cursor-pointer">
            <Image 
              src="/icons/ellipse1.png" 
              alt="User" 
              width={44} 
              height={44} 
              className="size-11 rounded-full hover:opacity-80 transition-opacity"
            />
          </Link>

          {/* Mobile hamburger for sidebar */}
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
