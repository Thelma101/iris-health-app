'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import SideMenu from '@/components/admin/SideMenu';
import Header from '@/components/admin/Header';

export default function FieldAgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if field agent is authenticated
    const token = localStorage.getItem('fieldAgentToken');
    const isLoginPage = pathname === '/field-agent/login';

    if (!token && !isLoginPage) {
      router.push('/field-agent/login');
    } else if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, [pathname, router]);

  // Show login page without layout
  if (pathname === '/field-agent/login') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c7be5]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="mx-auto w-full max-w-[1444px] overflow-hidden">
        <div className="mx-auto w-full flex flex-col lg:flex-row">
          <SideMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-x-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
