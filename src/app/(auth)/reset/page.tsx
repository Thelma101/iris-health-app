"use client";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Eye from "@/components/icons/Eye";
import EyeOff from "@/components/icons/EyeOff";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
    <main className="min-h-screen bg-neutral-100/50 backdrop-blur-[6px] flex items-center justify-center p-6">
      <div className="w-full max-w-[513px] bg-white rounded-[10px] border border-zinc-300 overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col items-center gap-10">
            <div className="flex flex-col items-center gap-4">
              <Image src="/images/logo.svg" alt="Logo" width={122} height={28} />
              <h1 className="text-center text-gray-800 text-base font-medium font-poppins">Reset your password</h1>
            </div>

            <form className="w-full flex flex-col gap-8" onSubmit={onSubmit}>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-500 text-sm font-medium font-poppins">New Password</label>
                  <Input
                    type={showPwd ? "text" : "password"}
                    name="password"
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    required
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    rightIcon={
                      <button type="button" onClick={() => setShowPwd((v) => !v)} className="text-foreground/70">
                        {showPwd ? <EyeOff /> : <Eye />}
                      </button>
                    }
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-500 text-sm font-medium font-poppins">Confirm New Password</label>
                  <Input
                    type={showConfirm ? "text" : "password"}
                    name="confirm"
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    rightIcon={
                      <button type="button" onClick={() => setShowConfirm((v) => !v)} className="text-foreground/70">
                        {showConfirm ? <EyeOff /> : <Eye />}
                      </button>
                    }
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-[#2c7be5] hover:bg-blue-600 text-white font-medium rounded-[10px] transition-colors cursor-pointer" 
                disabled={!valid}
              >
                Reset Password
              </Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
