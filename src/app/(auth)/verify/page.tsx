"use client";

import dynamic from "next/dynamic";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import React from "react";

const SKELETON_KEYS = ["otp-s1","otp-s2","otp-s3","otp-s4","otp-s5","otp-s6"];
const ClientOTPInput = dynamic(() => import("@/components/ui/OTPInput"), {
  ssr: false,
  loading: () => (
    <div className="flex gap-2">
      {SKELETON_KEYS.map((k) => (
        <div
          key={k}
          className="w-14 h-12 rounded-[4px] border border-[var(--gray-1)] bg-white animate-pulse"
        />
      ))}
    </div>
  ),
});

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = React.useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.push("/reset");
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[572px] flex flex-col items-center gap-12 sm:gap-16 md:gap-20">
        <div className="w-full flex flex-col items-center gap-2">
          <h1 className="h-[42px] text-center text-[28px] font-semibold text-[var(--mid-black)]">
            Verification
          </h1>
          <p className="text-center text-[16px] font-medium text-[var(--mid-black)]">
            Enter the 6-digit code sent to your email
          </p>
        </div>
        <form className="w-full flex flex-col items-center gap-6" onSubmit={onSubmit}>
          <ClientOTPInput length={6} onChange={setCode} />
          <Button type="submit" className="w-full" disabled={code.length !== 6}>
            Continue
          </Button>
          <button type="button" className="text-sm text-[var(--primary)]">
            Resend code
          </button>
        </form>
      </div>
    </main>
  );
}
