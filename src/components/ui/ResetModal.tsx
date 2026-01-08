"use client";
import Image from "next/image";
import React from "react";

type Props = {
  readonly open: boolean;
  readonly onClose: () => void;
};

export default function ResetModal({ open, onClose }: Props) {
  const [pwd, setPwd] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [phase, setPhase] = React.useState<"form" | "loading" | "success">("form");
  const valid = pwd.length >= 8 && pwd === confirm;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setPhase("loading");
    setTimeout(() => setPhase("success"), 1000);
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-neutral-100/50 backdrop-blur-[6px]" />
      <div className="absolute inset-0 grid place-items-center p-4">
        {phase === "form" && (
          <div className="w-full max-w-[513px] bg-white rounded-[10px] border border-zinc-300 overflow-hidden">
            <div className="p-4 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center gap-3.5 mx-auto">
                  <Image src="/logo.svg" alt="Logo" width={82} height={20} />
                  <div className="max-w-xs sm:w-56 text-center text-gray-800 text-sm sm:text-base font-medium font-poppins">Reset your password</div>
                </div>
                <button aria-label="Close" onClick={onClose} className="size-6 cursor-pointer hover:bg-gray-100 rounded transition-colors">×</button>
              </div>
              <form className="mt-6 sm:mt-10 flex flex-col gap-4 sm:gap-6" onSubmit={submit}>
                <div className="flex flex-col gap-1.5">
                  <div className="text-gray-500 text-xs sm:text-sm font-medium font-poppins">New Password</div>
                  <input
                    type="password"
                    className="h-10 sm:h-12 w-full border border-zinc-300 rounded-sm px-4 sm:px-6 text-sm"
                    placeholder="Enter new password"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="text-gray-500 text-xs sm:text-sm font-medium font-poppins">Confirm New Password</div>
                  <input
                    type="password"
                    className="h-10 sm:h-12 w-full border border-zinc-300 rounded-sm px-4 sm:px-6 text-sm"
                    placeholder="Enter new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" disabled={!valid} className="h-10 sm:h-12 w-full bg-blue-500 disabled:bg-blue-300 text-white text-sm sm:text-base rounded-[10px] cursor-pointer hover:bg-blue-600 disabled:hover:bg-blue-300 transition-colors">Reset Password</button>
              </form>
            </div>
          </div>
        )}

        {phase === "loading" && (
          <div className="size-32 grid place-items-center">
            <Image src="/icons/loader-icon.svg" alt="Loading" width={48} height={48} className="animate-spin" />
          </div>
        )}

        {phase === "success" && (
          <div className="w-full max-w-[513px] bg-white rounded-[10px] border border-zinc-300 overflow-hidden">
            <div className="p-4 sm:p-8">
              <div className="flex items-center justify-between">
                <Image src="/logo.svg" alt="Logo" width={82} height={20} />
                <button aria-label="Close" onClick={onClose} className="size-6 cursor-pointer hover:bg-gray-100 rounded transition-colors">×</button>
              </div>
              <div className="mt-4 sm:mt-6 text-center space-y-2">
                <div className="text-gray-800 text-sm sm:text-base font-medium font-poppins">Password successfully reset.</div>
                <div className="text-gray-800 text-xs sm:text-sm font-medium font-poppins">You can now log in to your account using your new password</div>
              </div>
              <div className="mt-6 sm:mt-10">
                <button onClick={onClose} className="w-full h-10 sm:h-12 bg-blue-500 text-white text-sm sm:text-base rounded-[10px] cursor-pointer hover:bg-blue-600 transition-colors">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
