"use client";
import React, { useState } from "react";
import SideMenu from "../../components/ui/SideMenu";
import Header from "@/components/ui/Header";
import MobileDashboard from "@/components/ui/MobileDashboard";

export default function DashboardLayout({ children }: { readonly children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileDashboardOpen, setMobileDashboardOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="mx-auto w-full max-w-[1444px]">
        <div className="mx-auto w-full flex flex-col lg:flex-row">
          <SideMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
      <MobileDashboard isOpen={mobileDashboardOpen} onClose={() => setMobileDashboardOpen(false)} />
    </div>
  );
}
