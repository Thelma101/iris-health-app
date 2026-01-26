"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Logo from "@/components/ui/Logo";
import Eye from "@/components/icons/Eye";
import EyeOff from "@/components/icons/EyeOff";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"agent" | "admin">("agent");
  const [show, setShow] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen relative">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/images/login-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[527px] rounded-[10px] border border-[var(--border)] bg-[var(--background)] shadow-xl p-6 sm:p-8">
          <div className="flex justify-center">
            <Logo />
          </div>
          <p className="mt-2 text-center text-sm text-foreground/80">
            Bringing Healthcare Closer
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              className={`rounded-full px-3 py-1 text-sm cursor-pointer ${
                role === "agent"
                  ? "bg-[var(--muted)]"
                  : "border border-[var(--border)]"
              }`}
              onClick={() => setRole("agent")}
              type="button"
            >
              Field Agent
            </button>
            <button
              className={`rounded-full px-3 py-1 text-sm cursor-pointer ${
                role === "admin"
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border border-[var(--border)]"
              }`}
              onClick={() => setRole("admin")}
              type="button"
            >
              Admin
            </button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <Input
              type="email"
              name="email"
              label="Email Address"
              placeholder="Email"
              autoComplete="email"
              required
            />
            <Input
              type={show ? "text" : "password"}
              name="password"
              label="Password"
              placeholder="************"
              autoComplete="current-password"
              required
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="text-foreground/70"
                >
                  {show ? <EyeOff /> : <Eye />}
                </button>
              }
            />
            <div className="flex items-center justify-between">
              <a href="/forgot" className="text-sm text-[var(--danger)]">
                Forgot Password
              </a>
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
