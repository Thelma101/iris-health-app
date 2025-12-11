"use client";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
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
  const valid = pwd.length >= 8 && pwd === confirm;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.push("/reset/success");
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-[434px] pt-[150px] pb-[454px]">
      <div className="w-[572px] flex flex-col items-center gap-[120px]">
        <div className="w-full flex flex-col items-center gap-2">
          <h1 className="h-[42px] text-center text-[28px] font-semibold text-[var(--mid-black)]">
            New Password
          </h1>
        </div>
        <form className="w-full flex flex-col gap-4" onSubmit={onSubmit}>
          <Input
            type={showPwd ? "text" : "password"}
            name="password"
            label="Password"
            placeholder="Enter new password"
            autoComplete="new-password"
            required
            onChange={(e) => setPwd(e.target.value)}
            rightIcon={
              <button type="button" onClick={() => setShowPwd((v) => !v)} className="text-foreground/70">
                {showPwd ? <EyeOff /> : <Eye />}
              </button>
            }
          />
          <Input
            type={showConfirm ? "text" : "password"}
            name="confirm"
            label="Confirm Password"
            placeholder="Re-enter new password"
            autoComplete="new-password"
            required
            onChange={(e) => setConfirm(e.target.value)}
            rightIcon={
              <button type="button" onClick={() => setShowConfirm((v) => !v)} className="text-foreground/70">
                {showConfirm ? <EyeOff /> : <Eye />}
              </button>
            }
          />
          <Button type="submit" className="w-full" disabled={!valid}>
            Reset Password
          </Button>
        </form>
      </div>
    </main>
  );
}