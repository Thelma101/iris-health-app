'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Icon, { IconName } from './Icon';
import Image from 'next/image';

const adminItems: ReadonlyArray<{ readonly label: string; readonly href: string; readonly iconName: IconName }> = [
  { label: 'Dashboard', href: '/dashboard', iconName: 'dashboard' },
  { label: 'Community', href: '/dashboard/community', iconName: 'community' },
  { label: 'Test Recording', href: '/dashboard/submit-test', iconName: 'test' },
  { label: 'Patients', href: '/dashboard/view-patients', iconName: 'patients' },
  { label: 'Analytics & Reports', href: '/dashboard/report', iconName: 'analytics' },
  { label: 'User Management', href: '/dashboard/user-management', iconName: 'users' },
];

const fieldAgentItems: ReadonlyArray<{ readonly label: string; readonly href: string; readonly iconName: IconName }> = [
  { label: 'Dashboard', href: '/field-agent/dashboard', iconName: 'dashboard' },
  { label: 'Community', href: '/field-agent/community', iconName: 'community' },
  { label: 'Test Recording', href: '/field-agent/test-recording', iconName: 'test' },
];

interface SideMenuProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen = true, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('user@email.com');
  const [userInitials, setUserInitials] = useState('U');

  const isFieldAgent = pathname.startsWith('/dashboard/field-agent') || pathname.startsWith('/field-agent');
  const items = isFieldAgent ? fieldAgentItems : adminItems;

  useEffect(() => {
    const dataKey = isFieldAgent ? 'fieldAgentData' : 'adminData';
    const userData = localStorage.getItem(dataKey);

    if (userData) {
      try {
        const data = JSON.parse(userData);
        const firstName = data.firstName || '';
        const lastName = data.lastName || '';
        const name = `${firstName} ${lastName}`.trim() || 'User';
        const email = data.email || 'user@email.com';
        const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';

        setUserName(name);
        setUserEmail(email);
        setUserInitials(initials);
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
  }, [isFieldAgent]);

  const handleLogout = () => {
    if (isFieldAgent) {
      localStorage.removeItem('fieldAgentToken');
      localStorage.removeItem('fieldAgentData');
      localStorage.removeItem('userRole');
      router.push('/field-agent/login');
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('adminData');
      localStorage.removeItem('userRole');
      router.push('/login');
    }
  };

  const sidebarContent = (
    <nav className="w-[200px] flex flex-col gap-3.5 h-full">
      <div className="flex flex-col gap-3.5 flex-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full relative rounded-lg flex items-center p-1.5 gap-2.5 text-sm font-poppins transition-all cursor-pointer ${active ? "bg-white text-[#212b36] shadow-[0px_4px_4px_0px_rgba(118,124,129,0.19)]" : "text-[#637381] hover:bg-white/50"
                }`}
              onClick={() => onClose?.()}
            >
              <Icon name={item.iconName} size={24} alt="" />
              <span className="relative whitespace-pre-wrap leading-normal">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <button onClick={handleLogout} className="flex items-center gap-2.5 p-1.5 text-[#d64545] hover:bg-red-50 rounded-lg transition-colors mt-auto">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 17L21 12M21 12L16 7M21 12H9M9 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-poppins text-sm">Logout</span>
      </button>
    </nav>
  );

  return (
    <>
      <aside className="hidden lg:flex w-[267px] min-h-screen bg-[#ecf4ff] flex-col pt-[109px] pl-[35px] pr-8 pb-8">
        <div className="flex flex-col h-[calc(100vh-109px-32px)]">
          {sidebarContent}
        </div>
      </aside>

      <div className="lg:hidden">
        {isOpen && (
          <button className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm" onClick={onClose} aria-label="Close menu" />
        )}

        <aside className={`fixed right-0 top-0 h-screen w-[280px] sm:w-[320px] bg-white flex flex-col z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Close Button */}
          <div className="flex justify-end p-4 border-b border-[#e5e7eb]">
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded transition-colors" aria-label="Close menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="flex flex-col px-6 py-6 gap-6">
            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#4a90e2] flex items-center justify-center text-white font-semibold text-sm shrink-0">
                {userInitials || 'M'}
              </div>
              <div className="flex flex-col min-w-0">
                <p className="text-[#212b36] text-sm font-medium font-poppins truncate">{userName || 'Mattew'}</p>
                <p className="text-[#637381] text-xs font-normal font-poppins truncate">{userEmail || 'Asuccess@gmail.com'}</p>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex flex-col gap-1">
              {items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 py-2.5 px-2 rounded-lg transition-colors ${active ? "bg-[#ecf4ff] text-[#212b36]" : "text-[#637381] hover:bg-gray-50"
                      }`}
                    onClick={() => onClose?.()}
                  >
                    <Icon name={item.iconName} size={20} alt="" />
                    <span className="font-poppins text-sm leading-normal">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
};

export default SideMenu;
