'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  const [agentName, setAgentName] = useState('Field Agent');

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
      <div className="h-full flex items-center justify-between px-4 lg:px-6">
        {/* Logo - Left side */}
        <div className="flex items-center gap-[11px]">
          <svg width="24" height="26" viewBox="0 0 24 26" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.9998 0.5L14.0221 8.02778L21.7128 5.29275L16.0223 11.5L21.7128 17.7072L14.0221 14.9722L11.9998 22.5L9.97748 14.9722L2.28679 17.7072L7.97728 11.5L2.28679 5.29275L9.97748 8.02778L11.9998 0.5Z" fill="#2ECC71"/>
            <circle cx="12" cy="11.5" r="3" fill="white"/>
          </svg>
          <span className="font-poppins text-xl font-semibold text-[#2c7be5]">MedTrack</span>
        </div>

        {/* Right cluster - notification + avatar + mobile menu */}
        <div className="flex items-center gap-4 lg:gap-[21px]">
          {/* Notification bell - circular button */}
          <button 
            aria-label="Notifications" 
            onClick={() => setNotifOpen(true)}
            className="relative size-8 flex items-center justify-center bg-[#f4f5f7] rounded-full border border-[#d9d9d9] cursor-pointer hover:bg-gray-200 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.35419 21C10.0593 21.6224 10.9856 22 12 22C13.0145 22 13.9407 21.6224 14.6458 21M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 11.0902 5.22047 13.206 4.34966 14.6054C3.61513 15.7859 3.24786 16.3761 3.26132 16.5408C3.27624 16.7231 3.31486 16.7926 3.46178 16.9016C3.59446 17 4.19259 17 5.38885 17H18.6112C19.8074 17 20.4056 17 20.5382 16.9016C20.6852 16.7926 20.7238 16.7231 20.7387 16.5408C20.7522 16.3761 20.3849 15.7859 19.6503 14.6054C18.7795 13.206 18 11.0902 18 8Z" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#d64545] rounded-full text-white text-[10px] font-medium flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Avatar - Profile icon (navigates to profile) */}
          <button 
            onClick={() => router.push('/field-agent/profile')}
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            aria-label="User profile"
          >
            <div className="w-11 h-11 rounded-full bg-[#2c7be5] flex items-center justify-center text-white font-poppins font-medium">
              {agentName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:block font-poppins text-sm text-[#212b36]">
              {agentName}
            </span>
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
          
          {/* Panel positioned on the right */}
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
