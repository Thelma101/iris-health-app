"use client";

import Eye from "@/components/icons/Eye";
import EyeOff from "@/components/icons/EyeOff";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api/index";
import { fieldAgentApi } from "@/lib/api/field-agent";
import Image from "next/image";
import Link from "next/link";
import { usePageLogger, useInteractionLogger } from "@/lib/utils/logging-hooks";

export default function LoginPage() {
  const router = useRouter();
  const logger = usePageLogger('LoginPage');
  const { logClick, logFormSubmit } = useInteractionLogger('LoginPage');
  const [role, setRole] = useState<"agent" | "admin">("agent");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    logFormSubmit('loginForm', { role, email: email.replace(/@.*/, '@***') });
    setLoading(true);
    setError(null);

    try {
      if (role === "admin") {
        // Admin login
        logger.info('Attempting admin login', { email: email.replace(/@.*/, '@***') });
        const response = await api.login({ email, password }) as any;
        
        if (response.success && response.data) {
          const token = response.data?.token || response.data?.data?.token;
          const adminData = response.data?.admin || response.data?.data?.admin;
          if (token) {
            localStorage.setItem("token", token);
            localStorage.setItem("userRole", "admin");
            if (adminData) {
              localStorage.setItem("adminData", JSON.stringify(adminData));
            }
            logger.info('Admin login successful', { adminId: adminData?._id });
            logger.navigate('/dashboard');
            router.push("/dashboard");
          } else {
            logger.error("No token in admin response", { response: 'token missing' });
            setError("Admin credentials not found. Please check your email and password, or switch to Field Agent login.");
          }
        } else {
          logger.error("Admin login failed", { error: response.error });
          setError(response.error || "Admin credentials not found. Please check your email and password, or switch to Field Agent login.");
        }
      } else {
        // Field Agent login
        logger.info('Attempting field agent login', { email: email.replace(/@.*/, '@***') });
        const response = await fieldAgentApi.login({ email, password }) as any;
        
        if (response.success && response.data) {
          const token = response.data?.token || response.data?.data?.token;
          const fieldAgent = response.data?.fieldAgent || response.data?.data?.fieldAgent;
          if (token) {
            localStorage.setItem("fieldAgentToken", token);
            localStorage.setItem("userRole", "field-agent");
            if (fieldAgent) {
              localStorage.setItem("fieldAgentData", JSON.stringify(fieldAgent));
            }
            logger.info('Field agent login successful', { agentId: fieldAgent?._id });
            logger.navigate('/field-agent/dashboard');
            router.push("/field-agent/dashboard");
          } else {
            logger.error("No token in field agent response", { response: 'token missing' });
            setError("Field Agent credentials not found. Please check your email and password, or switch to Admin login.");
          }
        } else {
          logger.error("Field agent login failed", { error: response.error });
          setError(response.error || "Field Agent credentials not found. Please check your email and password, or switch to Admin login.");
        }
      }
    } catch (err: unknown) {
      logger.error("Login exception", { error: err instanceof Error ? err.message : err });
      const errorMessage = err instanceof Error ? err.message : "Login failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/images/login-bg.jpg"
          alt="Healthcare background"
          className="w-full h-full object-cover"
        />
      </div>
      
      {/* Login Form Container */}
      <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[500px] sm:max-w-[450px] rounded-[10px] bg-white shadow-xl p-6 sm:p-8 md:p-10">
          {/* Logo Section */}
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            {/* MedTrack Logo */}
            <div className="flex items-center gap-[11px]">
              <Image
                src="/images/medtrack-icon.svg"
                alt="MedTrack Icon"
                width={24}
                height={26}
              />
              <Image
                src="/images/medtrack-text.svg"
                alt="MedTrack"
                width={154}
                height={24}
              />
            </div>
            
            {/* Tagline */}
            <p className="text-[#212b36] text-[18px] sm:text-[24px] font-medium font-poppins text-center">
              Bringing Healthcare Closer
            </p>
          </div>

          {/* Role Selection */}
          <div className="flex items-center justify-center gap-1 bg-[#f4f6f8] p-1 rounded-[10px] mt-6 sm:mt-8">
            <button
              type="button"
              onClick={() => setRole("agent")}
              className={`h-10 px-6 rounded-[8px] font-poppins text-sm font-medium transition-colors ${
                role === "agent"
                  ? "bg-[#2c7be5] text-white shadow-sm"
                  : "text-[#637381] hover:text-[#212b36]"
              }`}
            >
              Field Agent
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`h-10 px-6 rounded-[8px] font-poppins text-sm font-medium transition-colors ${
                role === "admin"
                  ? "bg-[#2c7be5] text-white shadow-sm"
                  : "text-[#637381] hover:text-[#212b36]"
              }`}
            >
              Admin
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center font-poppins">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form className="mt-6 sm:mt-8 flex flex-col gap-6" onSubmit={handleLogin}>
            <div className="flex flex-col gap-5">
              {/* Email Field */}
              <div className="flex flex-col gap-[6px]">
                <label className="text-[#637381] text-sm font-medium font-poppins">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 w-full px-4 bg-white border border-[#d9d9d9] rounded-lg text-sm text-[#212b36] placeholder:text-[#919eab] font-poppins focus:outline-none focus:border-[#2c7be5] focus:ring-1 focus:ring-[#2c7be5]"
                />
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-[6px]">
                <label className="text-[#637381] text-sm font-medium font-poppins">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 w-full px-4 pr-12 bg-white border border-[#d9d9d9] rounded-lg text-sm text-[#212b36] placeholder:text-[#919eab] font-poppins focus:outline-none focus:border-[#2c7be5] focus:ring-1 focus:ring-[#2c7be5]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#637381] hover:text-[#212b36]"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {/* Forgot Password Link */}
                <div className="flex justify-end mt-1">
                  <Link href="/forgot" className="text-sm text-[#2c7be5] hover:text-[#1e5aa8] hover:underline font-poppins">
                    Forgot Password
                  </Link>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full bg-[#2c7be5] hover:bg-[#1e5aa8] text-white text-base font-semibold font-poppins rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
