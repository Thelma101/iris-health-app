'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import FieldAgentSidebar from '@/components/field-agent/Sidebar';
import FieldAgentHeader from '@/components/field-agent/Header';

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
      <div className="min-h-screen flex items-center justify-center bg-[#ecf4ff]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2c7be5]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#ecf4ff] flex">
      {/* Sidebar */}
      <FieldAgentSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-[270px]">
        {/* Header */}
        <FieldAgentHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
