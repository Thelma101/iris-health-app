'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Icon, { IconName } from './Icon';
import Image from 'next/image';

// Field Agent side menu items - matches Figma 169:3640
const fieldAgentItems: ReadonlyArray<{ readonly label: string; readonly href: string; readonly iconName: IconName }> = [
  { label: 'Dashboard', href: '/dashboard', iconName: 'dashboard' },
  { label: 'Community', href: '/dashboard/community', iconName: 'community' },
  { label: 'Test Recording', href: '/dashboard/submit-test', iconName: 'test' },
];

interface SideMenuProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen = true, onClose }) => {
  const pathname = usePathname();
  const router = useRouter();
  
  const items = fieldAgentItems;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('fieldAgentToken');
    localStorage.removeItem('userRole');
    router.push('/login');
  };

  const sidebarContent = (
    <nav className="w-[200px] flex flex-col gap-[14px]">
      {items.map((item) => {
        const active = pathname === item.href;
        const baseClasses = "w-full relative rounded-lg flex items-center p-[6px] gap-2.5 text-sm font-poppins transition-all cursor-pointer";
        const activeClasses = active 
          ? "bg-white text-[#212b36] shadow-[0px_4px_4px_0px_rgba(118,124,129,0.19)]" 
          : "text-[#637381] hover:bg-white/50";

        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className={`${baseClasses} ${activeClasses}`}
            onClick={() => onClose?.()}
          >
            <Icon name={item.iconName} size={24} alt="" />
            <span className="relative whitespace-pre-wrap leading-normal">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar - matches Figma design 169:3640 */}
      <aside className="hidden lg:flex w-[267px] min-h-screen bg-[#ecf4ff] flex-col pt-[109px] pl-[35px] pr-8 pb-8 justify-between">
        {sidebarContent}
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 p-1.5 text-[#d64545] text-sm font-poppins hover:bg-white/50 rounded-lg transition-colors mt-auto"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="#D64545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 17L15 12L10 7" stroke="#D64545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 12H3" stroke="#D64545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Logout</span>
        </button>
      </aside>

      {/* Mobile Sidebar Drawer */}
      <div className="lg:hidden">
        {/* Overlay */}
        {isOpen && (
          <button
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close menu"
          />
        )}

        {/* Slide-in Sidebar from LEFT */}
        <aside 
          className={`fixed left-0 top-0 h-screen w-72 sm:w-80 bg-[#ecf4ff] flex flex-col z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Close Button Header */}
          <div className="flex justify-between items-center p-4 sm:p-6 border-b border-[#d9d9d9]">
            <span className="text-[#212b36] font-poppins font-medium">Menu</span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <Image src="/icons/cancel-01.svg" alt="Close" width={24} height={24} />
            </button>
          </div>

          {/* User Profile Section */}
          <div className="flex flex-col gap-8 sm:gap-10 p-4 sm:p-6">
            {/* User Info */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-blue-400 flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                TA
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-[#212b36] text-xs sm:text-sm font-normal font-poppins">Thelma Akpata</p>
                <p className="text-[#637381] text-xs font-normal font-poppins truncate">thelmaakpata@gmail.com</p>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="flex flex-col gap-3.5">
              {items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className={`flex items-center gap-2.5 p-1.5 rounded-lg transition-colors text-sm ${
                      active 
                        ? "bg-white text-[#212b36] shadow-[0px_4px_4px_0px_rgba(118,124,129,0.19)]" 
                        : "text-[#637381] hover:bg-white/50"
                    }`}
                    onClick={() => onClose?.()}
                  >
                    <Icon name={item.iconName} size={24} alt="" />
                    <span className="font-poppins leading-normal">{item.label}</span>
                  </Link>
                );
              })}
            </div>
            
            {/* Logout Button - Mobile */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 p-1.5 text-[#d64545] text-sm font-poppins hover:bg-white/50 rounded-lg transition-colors mt-8"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="#D64545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 17L15 12L10 7" stroke="#D64545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 12H3" stroke="#D64545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </aside>
      </div>
    </>
  );
};

export default SideMenu;
