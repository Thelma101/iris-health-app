'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';

interface HeaderProps {
  onMenuClick?: () => void;
}

type NotificationItem = {
  readonly id: string;
  readonly text: string;
  readonly date: string;
  readonly unread: boolean;
};

const NOTIFICATION_ITEMS: ReadonlyArray<NotificationItem> = [
  { id: "n1", text: "New community assignment received", date: "Jan 22, 2026 at 9:50 AM", unread: true },
  { id: "n2", text: "Test record submitted successfully", date: "Jan 21, 2026 at 2:30 PM", unread: false },
  { id: "n3", text: "Profile updated successfully", date: "Jan 20, 2026 at 11:00 AM", unread: false },
  { id: "n4", text: "New patient registered", date: "Jan 19, 2026 at 4:15 PM", unread: false },
];

export default function FieldAgentHeader({ onMenuClick }: HeaderProps) {
  const router = useRouter();
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

  const unreadCount = NOTIFICATION_ITEMS.filter(n => n.unread).length;

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
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#d64545] rounded-full text-white text-[10px] font-medium flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Avatar - Profile icon (navigates to profile) */}
          <button 
            onClick={() => router.push('/field-agent/profile')}
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

      {/* Notifications overlay - same as admin */}
      {notifOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-[6px] z-40" 
            onClick={() => setNotifOpen(false)}
          />
          
          {/* Panel positioned on the right - aligned with very top of page */}
          <div className="fixed top-0 right-0 z-50 w-full max-w-md h-screen" style={{ margin: 0 }}>
            {/* Notifications Panel */}
            <section className="w-full max-w-[466px] bg-white rounded-[10px] border border-zinc-300 overflow-hidden shadow-lg m-0">
              {/* Header */}
              <div className="h-12 w-full bg-white border-b border-[#d9d9d9] flex items-center justify-between px-4 sm:px-6 m-0">
                <h2 className="text-gray-800 text-lg sm:text-xl font-medium font-poppins m-0">Notifications</h2>
                <button 
                  aria-label="Close" 
                  onClick={() => setNotifOpen(false)} 
                  className="size-6 grid place-items-center cursor-pointer hover:bg-gray-100 rounded-md transition-colors m-0 p-0"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto p-4 sm:p-6 m-0">
                <div className="flex flex-col gap-3 sm:gap-4 m-0">
                  {NOTIFICATION_ITEMS.map((it) => (
                    <div key={it.id} className="flex items-start gap-2.5 m-0">
                      {/* Indicator dot */}
                      <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 m-0 ${it.unread ? 'bg-[#2C7BE5]' : 'bg-zinc-300'}`} />
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0 m-0">
                        <p className="text-gray-800 text-xs sm:text-sm font-normal font-poppins leading-snug m-0">{it.text}</p>
                        <p className="text-gray-500 text-xs font-normal font-poppins mt-1 m-0">{it.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </header>
  );
}
