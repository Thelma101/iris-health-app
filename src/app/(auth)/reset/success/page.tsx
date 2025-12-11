import Link from "next/link";

export default function ResetSuccessPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-[434px] pt-[150px] pb-[454px]">
      <div className="w-[572px] text-center flex flex-col items-center gap-[24px]">
        <h1 className="h-[42px] text-[28px] font-semibold text-[var(--mid-black)]">Success</h1>
        <p className="mt-2 text-sm text-foreground/70">Your password has been reset successfully.</p>
        <Link
          href="/login"
          className="mt-6 inline-block w-full text-center rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 cursor-pointer"
        >
          Back to Login
        </Link>
      </div>
    </main>
  );
}