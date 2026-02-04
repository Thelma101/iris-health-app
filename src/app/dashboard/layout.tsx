"use client";
import React, { useState } from "react";
import SideMenu from "@/components/admin/SideMenu";
import Header from "@/components/admin/Header";
import MobileDashboard from "@/components/admin/MobileDashboard";

export default function DashboardLayout({ children }: { readonly children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileDashboardOpen, setMobileDashboardOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#ECF4FF] overflow-x-hidden">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="w-full">
        <div className="w-full flex flex-col lg:flex-row">
          <SideMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 min-w-0 overflow-x-hidden bg-[#ECF4FF] pt-[14px] pb-[14px] pl-[14px] pr-0">{children}</main>
        </div>
      </div>
      <MobileDashboard isOpen={mobileDashboardOpen} onClose={() => setMobileDashboardOpen(false)} />
    </div>
  );
}
