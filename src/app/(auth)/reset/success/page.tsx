import Link from "next/link";
import Image from "next/image";

export default function ResetSuccessPage() {
  return (
    <main className="min-h-screen bg-neutral-100/50 backdrop-blur-[6px] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[513px] bg-white rounded-[10px] border border-zinc-300 overflow-hidden">
        <div className="p-4 sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:gap-10">
            <div className="flex flex-col items-center gap-4">
              <Image src="/images/logo.svg" alt="Logo" width={122} height={28} />
              <div className="flex flex-col items-center gap-3">
                <h1 className="text-center text-gray-800 text-sm sm:text-base font-medium font-poppins">Password successfully reset.</h1>
                <p className="text-center text-gray-600 text-xs sm:text-sm font-medium font-poppins max-w-xs">You can now log in to your account using your new password</p>
              </div>
            </div>

            <Link href="/login" className="w-full">
              <button className="w-full h-10 sm:h-12 rounded-[10px] bg-[#2c7be5] hover:bg-blue-600 text-white font-medium text-sm sm:text-base transition-colors cursor-pointer">
                Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
