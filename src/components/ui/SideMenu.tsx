'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon, { IconName } from './Icon';
import Image from 'next/image';

const items: ReadonlyArray<{ readonly label: string; readonly href: string; readonly iconName: IconName }> = [
  { label: 'Dashboard', href: '/dashboard', iconName: 'dashboard' },
  { label: 'Community', href: '/dashboard/community', iconName: 'community' },
  { label: 'Test Recording', href: '/dashboard/submit-test', iconName: 'test' },
  { label: 'Patients', href: '/dashboard/view-patients', iconName: 'patients' },
  { label: 'Analytics & Reports', href: '/dashboard/report', iconName: 'analytics' },
  { label: 'User Management', href: '/dashboard/user-management', iconName: 'users' },
  // { label: 'Profile', href: '/dashboard/profile', iconName: 'profile' },
];

interface SideMenuProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen = true, onClose }) => {
  const pathname = usePathname();

  const sidebarContent = (
    <nav className="w-full lg:w-48 flex flex-col gap-3.5">
      {items.map((item) => {
        const active = pathname === item.href;
        const baseClasses = "w-full relative rounded-lg flex items-center p-1.5 box-border gap-2.5 text-sm font-poppins transition-all cursor-pointer";
        const activeClasses = active 
          ? "bg-white text-gray-800 shadow-[0px_4px_4px_0px_rgba(118,124,129,0.19)]" 
          : "text-[#708090]";

        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className={`${baseClasses} ${activeClasses}`}
            onClick={() => onClose?.()}
          >
            <Icon name={item.iconName} size={24} alt="" />
            <div className="relative whitespace-pre-wrap">{item.label}</div>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 min-h-screen bg-indigo-50 flex-col pt-[109px] pl-[35px] pr-6 pb-8">
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
          className={`fixed right-0 top-0 h-screen w-72 sm:w-80 bg-white flex flex-col z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Close Button Header */}
          <div className="flex justify-end p-4 sm:p-6 border-b border-gray-200">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                <p className="text-gray-800 text-xs sm:text-sm font-normal font-poppins">Thelma Akpata</p>
                <p className="text-gray-500 text-xs font-normal font-poppins truncate">thelmaakpata@gmail.com</p>
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
                    className={`flex items-center gap-3 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
                      active 
                        ? "bg-blue-50 text-blue-600" 
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                    onClick={() => onClose?.()}
                  >
                    <Icon name={item.iconName} size={20} alt="" />
                    <span className="font-poppins truncate">{item.label}</span>
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
