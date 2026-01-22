"use client";

import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const newCode = [...code];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newCode[i] = char;
    });
    setCode(newCode);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const isComplete = code.every((digit) => digit !== "");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isComplete) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/reset");
    }, 1000);
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[519px] flex flex-col items-center gap-[120px]">
        {/* Title */}
        <h1 className="h-[42px] text-center text-[28px] font-semibold text-[#637381] font-poppins">
          Verification
        </h1>

        {/* Form Section */}
        <form onSubmit={onSubmit} className="w-full max-w-[462px] flex flex-col gap-[68px] items-center">
          <div className="w-full flex flex-col gap-[31px] items-center">
            {/* OTP Input Section */}
            <div className="w-full max-w-[448px] flex flex-col gap-6 items-center">
              <p className="w-full text-center text-base font-medium text-[#637381] font-poppins">
                Enter Verification Code
              </p>
              
              {/* OTP Boxes */}
              <div className="flex gap-8" onPaste={handlePaste}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 bg-white border border-[#d9d9d9] rounded text-center text-xl font-semibold text-[#212b36] focus:outline-none focus:border-[#2c7be5]"
                  />
                ))}
              </div>
            </div>

            {/* Resend Link */}
            <p className="text-center text-sm font-medium font-poppins">
              <span className="text-[#b1b9c0]">{"If you didn't receive a code "}</span>
              <button type="button" className="text-[#2c7be5] hover:underline">
                Resend
              </button>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isComplete}
            className="w-full max-w-[448px] h-12 bg-[#2c7be5] hover:bg-blue-600 text-white text-base font-medium font-inter rounded-[10px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Send"}
          </button>
        </form>
      </div>
    </main>
  );
}
