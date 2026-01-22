"use client";

import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      router.push("/verify");
    }, 1000);
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[572px] flex flex-col items-center gap-[120px]">
        {/* Title */}
        <h1 className="h-[42px] text-center text-[28px] font-semibold text-[#637381] font-poppins">
          Forgot Password
        </h1>

        {/* Form Section */}
        <div className="w-full flex flex-col gap-[68px] items-center">
          <div className="w-full flex flex-col gap-[25px] items-start">
            {/* Input Section */}
            <div className="w-full flex flex-col gap-6 items-start">
              <p className="w-full text-center text-base font-medium text-[#637381] font-poppins">
                Enter Email Address
              </p>
              <div className="w-full h-12 bg-white border border-[#d9d9d9] rounded overflow-hidden">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  className="w-full h-full px-[21px] text-sm text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none"
                />
              </div>
            </div>

            {/* Back to Sign in */}
            <p className="w-full text-center text-sm font-medium text-[#b1b9c0] font-poppins">
              <Link href="/login" className="hover:text-[#2c7be5] transition-colors">
                Back to Sign in
              </Link>
            </p>
          </div>

          {/* Submit Button */}
          <form onSubmit={onSubmit} className="w-full">
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full h-12 bg-[#2c7be5] hover:bg-blue-600 text-white text-base font-medium font-inter rounded-[10px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}