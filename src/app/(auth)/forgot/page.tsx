"use client";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.push("/verify");
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[572px] flex flex-col items-center gap-12 sm:gap-16 md:gap-20">
        <div className="w-full flex flex-col items-center gap-2">
          <h1 className="h-[42px] text-center text-[28px] font-semibold text-[var(--mid-black)]">
            Forgot Password
          </h1>
          <p className="text-center text-[16px] font-medium text-[var(--mid-black)]">
            Enter Email Address
          </p>
        </div>
        <form className="w-full flex flex-col gap-4" onSubmit={onSubmit}>
          <Input
            type="email"
            name="email"
            placeholder="Email"
            autoComplete="email"
            required
          />
          <div className="text-center text-sm text-foreground/50">
            <Link href="/login">Back to Sign in</Link>
          </div>
          <Button type="submit" size="lg" className="w-full h-12 rounded-[8px]">
            Send
          </Button>
        </form>
      </div>
    </main>
  );
}