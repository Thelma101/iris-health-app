"use client";

import Eye from "@/components/icons/Eye";
import EyeOff from "@/components/icons/EyeOff";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api/index";
import { fieldAgentApi } from "@/lib/api/field-agent";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"agent" | "admin">("agent");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (role === "admin") {
        // Admin login
        const response = await api.login({ email, password }) as any;
        
        if (response.success && response.data) {
          const token = response.data?.token || response.data?.data?.token;
          if (token) {
            localStorage.setItem("token", token);
            localStorage.setItem("userRole", "admin");
            router.push("/dashboard");
          } else {
            setError("Invalid admin credentials");
          }
        } else {
          setError(response.error || "Invalid admin credentials");
        }
      } else {
        // Field Agent login
        const response = await fieldAgentApi.login({ email, password }) as any;
        
        if (response.success && response.data) {
          const token = response.data?.token || response.data?.data?.token;
          if (token) {
            localStorage.setItem("fieldAgentToken", token);
            localStorage.setItem("userRole", "field-agent");
            router.push("/field-agent/dashboard");
          } else {
            setError("Invalid field agent credentials");
          }
        } else {
          setError(response.error || "Invalid field agent credentials");
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Image - Optimized with Next/Image */}
      <div className="absolute inset-0">
        <img
          src="/images/login-bg.jpg"
          alt="Healthcare background"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Login Form Container */}
      <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[400px] sm:max-w-[450px] rounded-[10px] bg-white shadow-xl p-6 sm:p-8 md:p-10">
          {/* Logo Section */}
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            {/* MedTrack Logo */}
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Icon */}
              <svg width="30" height="33" viewBox="0 0 35 38" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-[35px] sm:h-[38px]">
                <path d="M17.5 0L17.5 14.25" stroke="#00AB9F" strokeWidth="4" strokeLinecap="round"/>
                <path d="M17.5 23.75L17.5 38" stroke="#00AB9F" strokeWidth="4" strokeLinecap="round"/>
                <path d="M0 19L14.25 19" stroke="#2C7BE5" strokeWidth="4" strokeLinecap="round"/>
                <path d="M20.75 19L35 19" stroke="#2C7BE5" strokeWidth="4" strokeLinecap="round"/>
                <circle cx="17.5" cy="19" r="6" fill="#00AB9F"/>
              </svg>
              {/* Text */}
              <span className="text-[26px] sm:text-[32px] font-semibold">
                <span className="text-[#00ab9f]">Med</span>
                <span className="text-[#2c7be5]">Track</span>
              </span>
            </div>
            
            {/* Tagline */}
            <p className="text-[#212b36] text-[18px] sm:text-[24px] font-medium font-['Poppins'] text-center">
              Bringing Healthcare Closer
            </p>
          </div>

          {/* Role Selection */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
            <button
              type="button"
              onClick={() => setRole("agent")}
              className={`h-9 sm:h-10 px-4 sm:px-5 rounded-[10px] text-sm font-normal font-['Poppins'] transition-colors ${
                role === "agent"
                  ? "bg-[#2c7be5] text-white"
                  : "bg-white text-[#637381] border border-[#d9d9d9]"
              }`}
            >
              Field Agent
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`h-9 sm:h-10 px-4 sm:px-5 rounded-[10px] text-sm font-normal font-['Poppins'] transition-colors ${
                role === "admin"
                  ? "bg-[#2c7be5] text-white"
                  : "bg-white text-[#637381] border border-[#d9d9d9]"
              }`}
            >
              Admin
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form className="mt-6 sm:mt-8 flex flex-col gap-8 sm:gap-10" onSubmit={handleLogin}>
            <div className="flex flex-col gap-5 sm:gap-[26px]">
              {/* Email Field */}
              <div className="flex flex-col gap-[6px]">
                <label className="text-[#637381] text-sm font-medium font-['Poppins']">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 sm:h-12 w-full px-4 sm:px-5 bg-white border border-[#d9d9d9] rounded text-sm text-[#212b36] placeholder:text-[#d9d9d9] font-['Poppins'] focus:outline-none focus:border-[#2c7be5] focus:ring-1 focus:ring-[#2c7be5]"
                />
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-[6px]">
                <label className="text-[#637381] text-sm font-medium font-['Poppins']">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="****************"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 sm:h-12 w-full px-4 sm:px-5 pr-12 bg-white border border-[#d9d9d9] rounded text-sm text-[#212b36] placeholder:text-[#212b36] font-['Poppins'] focus:outline-none focus:border-[#2c7be5] focus:ring-1 focus:ring-[#2c7be5]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#637381]"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {/* Forgot Password Link - Positioned below password */}
                <div className="flex justify-end mt-1">
                  <a href="/forgot" className="text-sm text-[#d64545] hover:underline font-['Poppins']">
                    Forgot Password
                  </a>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="h-11 sm:h-12 w-full bg-[#2c7be5] hover:bg-[#1e5db8] text-white text-base font-medium font-['Inter'] rounded-[10px] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
