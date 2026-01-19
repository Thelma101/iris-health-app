'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  onMenuClick?: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function FieldAgentHeader({ onMenuClick }: HeaderProps) {
  const [agentName, setAgentName] = useState('Field Agent');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'New Assignment', message: 'You have been assigned to Ikeja Central community', time: '2 hours ago', read: false },
    { id: '2', title: 'Test Reminder', message: 'Complete pending test reports for today', time: '5 hours ago', read: false },
    { id: '3', title: 'System Update', message: 'App will undergo maintenance tonight', time: '1 day ago', read: true },
  ]);
  const notificationRef = useRef<HTMLDivElement>(null);
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

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-[#d9d9d9] lg:border lg:rounded-none">
      <div className="h-14 lg:h-[65px] px-4 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src="/images/favicon.svg"
            alt="MedTrack"
            width={20}
            height={22}
            className="w-5 h-[22px] lg:w-6 lg:h-[26px]"
            loading="eager"
          />
          <Image
            src="/images/logo.svg"
            alt="MedTrack"
            width={130}
            height={18}
            className="h-[18px] lg:h-6 w-auto"
            loading="eager"
            style={{ width: 'auto' }}
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 lg:gap-5">
          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-8 h-8 flex items-center justify-center bg-[#f4f5f7] rounded-full border border-[#d9d9d9] hover:bg-gray-200 transition-colors cursor-pointer"
              aria-label="Notifications"
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

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-[#d9d9d9] z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-[#d9d9d9] flex items-center justify-between">
                  <h3 className="font-poppins font-semibold text-sm text-[#212b36]">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-[#2c7be5] hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-[#637381] text-sm">
                      No notifications
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className={`px-4 py-3 border-b border-[#f4f5f7] cursor-pointer hover:bg-[#f9fafb] transition-colors ${!notification.read ? 'bg-[#f0f7ff]' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!notification.read ? 'bg-[#2c7be5]' : 'bg-transparent'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-poppins font-medium text-sm text-[#212b36] truncate">{notification.title}</p>
                            <p className="font-poppins text-xs text-[#637381] mt-0.5 line-clamp-2">{notification.message}</p>
                            <p className="font-poppins text-xs text-[#919eab] mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-2 border-t border-[#d9d9d9]">
                  <button className="w-full text-center text-sm text-[#2c7be5] hover:underline cursor-pointer py-1">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar - Desktop Only */}
          <button
            onClick={() => router.push('/field-agent/profile')}
            className="hidden lg:flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-[#2c7be5] flex items-center justify-center text-white font-poppins font-medium">
              {agentName.charAt(0).toUpperCase()}
            </div>
            <span className="font-poppins text-sm text-[#212b36]">
              {agentName}
            </span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1 text-[#637381] hover:text-[#212b36] cursor-pointer"
            aria-label="Open menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
