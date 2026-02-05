'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

// Icon paths from public/icons folder
const icons = {
  dashboard: '/icons/dashboard-square-01.svg',
  community: '/icons/user-group-02.svg',
  testRecording: '/icons/medical-file.svg',
  patients: '/icons/patient.svg',
  analytics: '/icons/analytics-01.svg',
  userManagement: '/icons/user-multiple-03.svg',
  logout: '/icons/logout-square-01.svg',
};

const adminItems = [
  { label: 'Dashboard', href: '/dashboard', icon: icons.dashboard },
  { label: 'Community', href: '/dashboard/community', icon: icons.community },
  { label: 'Test Recording', href: '/dashboard/submit-test', icon: icons.testRecording },
  { label: 'Patients', href: '/dashboard/view-patients', icon: icons.patients },
  { label: 'Analytics & Reports', href: '/dashboard/report', icon: icons.analytics },
  { label: 'User Management', href: '/dashboard/user-management', icon: icons.userManagement },
];

const fieldAgentItems = [
  { label: 'Dashboard', href: '/field-agent/dashboard', icon: icons.dashboard },
  { label: 'Community', href: '/field-agent/community', icon: icons.community },
  { label: 'Test Recording', href: '/field-agent/test-recording', icon: icons.testRecording },
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
    <nav className="w-full flex flex-col gap-2">
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`w-full rounded-lg flex items-center p-1.5 gap-2.5 text-sm font-poppins transition-all cursor-pointer ${
              active
                ? "bg-white text-[#212B36] shadow-[0px_4px_4px_rgba(118,124,129,0.19)]"
                : "bg-[#ECF4FF] text-[#637381] hover:bg-white/50"
            }`}
            onClick={() => onClose?.()}
          >
            <Image 
              src={item.icon} 
              alt={item.label} 
              width={24} 
              height={24}
              className={active ? "opacity-100" : "opacity-70"}
            />
            <span className="whitespace-nowrap leading-normal">{item.label}</span>
          </Link>
        );
      })}

      {/* Logout button styled same as menu items */}
      <button
        onClick={handleLogout}
        className="w-full rounded-lg flex items-center p-1.5 gap-2.5 text-sm font-poppins transition-all cursor-pointer text-[#d64545] hover:bg-red-50 mt-4"
      >
        <Image src={icons.logout} alt="Logout" width={24} height={24} />
        <span className="whitespace-nowrap leading-normal">Logout</span>
      </button>
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar - wider per Figma design */}
      <aside className="hidden lg:flex w-[280px] min-h-screen bg-[#ECF4FF] flex-col pt-[44px] px-8 pb-8">
        <div className="flex flex-col w-full">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        {isOpen && (
          <button className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm" onClick={onClose} aria-label="Close menu" />
        )}

        <aside className={`fixed right-0 top-0 h-screen w-[300px] sm:w-[340px] bg-white flex flex-col z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
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
            <div className="flex flex-col gap-2">
              {items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 p-1.5 rounded-lg transition-colors ${
                      active ? "bg-[#ECF4FF] text-[#212b36] shadow-[0px_4px_4px_rgba(118,124,129,0.19)]" : "text-[#637381] hover:bg-gray-50"
                    }`}
                    onClick={() => onClose?.()}
                  >
                    <Image 
                      src={item.icon} 
                      alt={item.label} 
                      width={24} 
                      height={24}
                      className={active ? "opacity-100" : "opacity-70"}
                    />
                    <span className="font-poppins text-sm leading-normal">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 p-1.5 text-[#d64545] hover:bg-red-50 rounded-lg transition-colors mt-auto"
            >
              <Image src={icons.logout} alt="Logout" width={20} height={20} />
              <span className="font-poppins text-sm">Logout</span>
            </button>
          </div>
        </aside>
      </div>
    </>
  );
};

export default SideMenu;
