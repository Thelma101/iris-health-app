'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

// SVG Icons matching Figma design exactly
const DashboardIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke={active ? "#212B36" : "#637381"} strokeWidth="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke={active ? "#212B36" : "#637381"} strokeWidth="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke={active ? "#212B36" : "#637381"} strokeWidth="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5" stroke={active ? "#212B36" : "#637381"} strokeWidth="1.5"/>
  </svg>
);

const CommunityIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="7" r="3" stroke={active ? "#212B36" : "#637381"} strokeWidth="1.5"/>
    <circle cx="18" cy="9" r="2.5" stroke={active ? "#212B36" : "#637381"} strokeWidth="1.5"/>
    <circle cx="6" cy="9" r="2.5" stroke={active ? "#212B36" : "#637381"} strokeWidth="1.5"/>
    <path d="M8 14C5.79086 14 4 15.7909 4 18V20H20V18C20 15.7909 18.2091 14 16 14" stroke={active ? "#212B36" : "#637381"} strokeWidth="1.5"/>
    <path d="M9 13C9 11.3431 10.3431 10 12 10C13.6569 10 15 11.3431 15 13V14H9V13Z" stroke={active ? "#212B36" : "#637381"} strokeWidth="1.5"/>
  </svg>
);

const TestIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke={active ? "#212B36" : "#637381"} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M13 3V8C13 8.55228 13.4477 9 14 9H19" stroke={active ? "#212B36" : "#637381"} strokeWidth="1.5"/>
  </svg>
);

const PatientsIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke={active ? "#212B36" : "#637381"} strokeWidth="1.5"/>
    <path d="M5 20C5 16.134 8.13401 13 12 13C15.866 13 19 16.134 19 20" stroke={active ? "#212B36" : "#637381"} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const AnalyticsIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke={active ? "#212B36" : "#637381"} strokeWidth="1.5"/>
    <path d="M7 14L10 11L13 14L17 10" stroke={active ? "#212B36" : "#637381"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UsersIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="7" r="3" stroke={active ? "#212B36" : "#637381"} strokeWidth="1.5"/>
    <circle cx="17" cy="9" r="2" stroke={active ? "#212B36" : "#637381"} strokeWidth="1.5"/>
    <path d="M3 19C3 16.2386 5.23858 14 8 14H10C12.7614 14 15 16.2386 15 19V20H3V19Z" stroke={active ? "#212B36" : "#637381"} strokeWidth="1.5"/>
    <path d="M15 14H16C18.2091 14 20 15.7909 20 18V20H17" stroke={active ? "#212B36" : "#637381"} strokeWidth="1.5"/>
  </svg>
);

const adminItems = [
  { label: 'Dashboard', href: '/dashboard', Icon: DashboardIcon },
  { label: 'Community', href: '/dashboard/community', Icon: CommunityIcon },
  { label: 'Test Recording', href: '/dashboard/submit-test', Icon: TestIcon },
  { label: 'Patients', href: '/dashboard/view-patients', Icon: PatientsIcon },
  { label: 'Analytics & Reports', href: '/dashboard/report', Icon: AnalyticsIcon },
  { label: 'User Management', href: '/dashboard/user-management', Icon: UsersIcon },
];

const fieldAgentItems = [
  { label: 'Dashboard', href: '/field-agent/dashboard', Icon: DashboardIcon },
  { label: 'Community', href: '/field-agent/community', Icon: CommunityIcon },
  { label: 'Test Recording', href: '/field-agent/test-recording', Icon: TestIcon },
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
    <nav className="w-[200px] flex flex-col gap-[6px]">
      {items.map((item) => {
        const active = pathname === item.href;
        const { Icon } = item;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`w-full rounded-[8px] flex items-center py-[6px] px-[6px] gap-[10px] text-[14px] font-poppins transition-all cursor-pointer ${
              active
                ? "bg-white text-[#212B36] shadow-[0px_4px_4px_0px_rgba(118,124,129,0.19)]"
                : "text-[#637381] hover:bg-white/50"
            }`}
            onClick={() => onClose?.()}
          >
            <Icon active={active} />
            <span className="whitespace-nowrap leading-normal">{item.label}</span>
          </Link>
        );
      })}

      {/* Logout button styled same as menu items */}
      <button
        onClick={handleLogout}
        className="w-full rounded-[8px] flex items-center py-[6px] px-[6px] gap-[10px] text-[14px] font-poppins transition-all cursor-pointer text-[#d64545] hover:bg-red-50 mt-4"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 17L21 12M21 12L16 7M21 12H9M9 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="whitespace-nowrap leading-normal">Logout</span>
      </button>
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar - matches Figma exactly */}
      <aside className="hidden lg:flex w-[267px] min-h-screen bg-[#ECF4FF] flex-col pt-[44px] pl-[35px] pr-[32px] pb-8">
        <div className="flex flex-col">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        {isOpen && (
          <button className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm" onClick={onClose} aria-label="Close menu" />
        )}

        <aside className={`fixed right-0 top-0 h-screen w-[280px] sm:w-[320px] bg-white flex flex-col z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Close Button */}
          <div className="flex justify-end p-4 border-b border-[#e5e7eb]">
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded transition-colors" aria-label="Close menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                const { Icon } = item;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 py-2.5 px-2 rounded-lg transition-colors ${
                      active ? "bg-[#ecf4ff] text-[#212b36]" : "text-[#637381] hover:bg-gray-50"
                    }`}
                    onClick={() => onClose?.()}
                  >
                    <Icon active={active} />
                    <span className="font-poppins text-sm leading-normal">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 py-2.5 px-2 text-[#d64545] hover:bg-red-50 rounded-lg transition-colors mt-auto"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 17L21 12M21 12L16 7M21 12H9M9 3H7.8C6.11984 3 5.27976 3 4.63803 3.32698C4.07354 3.6146 3.6146 4.07354 3.32698 4.63803C3 5.27976 3 6.11984 3 7.8V16.2C3 17.8802 3 18.7202 3.32698 19.362C3.6146 19.9265 4.07354 20.3854 4.63803 20.673C5.27976 21 6.11984 21 7.8 21H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-poppins text-sm">Logout</span>
            </button>
          </div>
        </aside>
      </div>
    </>
  );
};

export default SideMenu;
