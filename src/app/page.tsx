"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const adminToken = localStorage.getItem("token");
    const fieldAgentToken = localStorage.getItem("fieldAgentToken");
    const userRole = localStorage.getItem("userRole");

    if (adminToken && userRole === "admin") {
      router.replace("/dashboard");
    } else if (fieldAgentToken && userRole === "field-agent") {
      router.replace("/field-agent/dashboard");
    } else {
      // Redirect to login if not authenticated
      router.replace("/login");
    }
  }, [router]);

  // Show loading while checking auth
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        {/* MedTrack Logo */}
        <div className="flex items-center gap-4">
          <svg width="35" height="38" viewBox="0 0 35 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.5 0L17.5 14.25" stroke="#00AB9F" strokeWidth="4" strokeLinecap="round"/>
            <path d="M17.5 23.75L17.5 38" stroke="#00AB9F" strokeWidth="4" strokeLinecap="round"/>
            <path d="M0 19L14.25 19" stroke="#2C7BE5" strokeWidth="4" strokeLinecap="round"/>
            <path d="M20.75 19L35 19" stroke="#2C7BE5" strokeWidth="4" strokeLinecap="round"/>
            <circle cx="17.5" cy="19" r="6" fill="#00AB9F"/>
          </svg>
          <span className="text-[32px] font-semibold">
            <span className="text-[#00ab9f]">Med</span>
            <span className="text-[#2c7be5]">Track</span>
          </span>
        </div>
        <p className="text-[#637381] text-sm">Loading...</p>
      </div>
    </main>
  );
}