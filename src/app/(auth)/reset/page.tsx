"use client";

import Eye from "@/components/icons/Eye";
import EyeOff from "@/components/icons/EyeOff";
import { useRouter } from "next/navigation";
import React from "react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [pwd, setPwd] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [showPwd, setShowPwd] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const valid = pwd.length >= 6 && pwd === confirm;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/reset/success");
    }, 1000);
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[519px] flex flex-col items-center gap-[120px]">
        {/* Title */}
        <h1 className="text-center text-[28px] font-semibold text-[#637381] font-poppins">
          New Password
        </h1>

        {/* Form Section */}
        <form onSubmit={onSubmit} className="w-full flex flex-col gap-[68px] items-center">
          <div className="w-full flex flex-col gap-[26px]">
            {/* New Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#637381] font-poppins">
                Enter New Password
              </label>
              <div className="relative h-12 bg-white border border-[#d9d9d9] rounded overflow-hidden">
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="hdhdhhdhdjjdjd"
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  className="w-full h-full px-[21px] pr-12 text-sm text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#637381]"
                >
                  {showPwd ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#637381] font-poppins">
                Confirm Password
              </label>
              <div className="relative h-12 bg-white border border-[#d9d9d9] rounded overflow-hidden">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="****************"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full h-full px-[21px] pr-12 text-sm text-[#212b36] placeholder:text-[#212b36] font-poppins focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#637381]"
                >
                  {showConfirm ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !valid}
            className="w-full h-12 bg-[#2c7be5] hover:bg-blue-600 text-white text-base font-medium font-inter rounded-[10px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting..." : "Send"}
          </button>
        </form>
      </div>
    </main>
  );
}
