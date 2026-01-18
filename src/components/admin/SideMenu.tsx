'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon, { IconName } from './Icon';
import Image from 'next/image';

// Admin menu items (6 items)
const adminItems: ReadonlyArray<{ readonly label: string; readonly href: string; readonly iconName: IconName }> = [
  { label: 'Dashboard', href: '/dashboard', iconName: 'dashboard' },
  { label: 'Community', href: '/dashboard/community', iconName: 'community' },
  { label: 'Test Recording', href: '/dashboard/submit-test', iconName: 'test' },
  { label: 'Patients', href: '/dashboard/view-patients', iconName: 'patients' },
  { label: 'Analytics & Reports', href: '/dashboard/report', iconName: 'analytics' },
  { label: 'User Management', href: '/dashboard/user-management', iconName: 'users' },
];

// Field Agent menu items (3 items only)
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
  
  // Detect if we're on field agent dashboard (either /dashboard/field-agent or /field-agent/*)
  const isFieldAgent = pathname.startsWith('/dashboard/field-agent') || pathname.startsWith('/field-agent');
  const items = isFieldAgent ? fieldAgentItems : adminItems;

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
      {/* Desktop Sidebar - matches Figma design 1:793 */}
      <aside className="hidden lg:flex w-[267px] min-h-screen bg-[#ecf4ff] flex-col pt-[109px] pl-[35px] pr-[32px] pb-8">
        {sidebarContent}
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

        {/* Slide-in Sidebar from RIGHT */}
        <aside 
          className={`fixed right-0 top-0 h-screen w-72 sm:w-80 bg-[#ecf4ff] flex flex-col z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Close Button Header */}
          <div className="flex justify-end p-4 sm:p-6 border-b border-[#d9d9d9]">
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
            <div className="flex flex-col gap-[14px]">
              {items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className={`flex items-center gap-2.5 p-[6px] rounded-lg transition-colors text-sm ${
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
          </div>
        </aside>
      </div>
    </>
  );
};

export default SideMenu;
