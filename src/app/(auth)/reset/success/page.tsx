import Link from "next/link";
import Image from "next/image";

export default function ResetSuccessPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[513px] bg-white rounded-[10px] border border-[#f5f5f5] overflow-hidden shadow-sm">
        <div className="p-8 sm:p-12">
          <div className="flex flex-col items-center gap-10">
            {/* Success Icon/Image */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-[122px] h-[28px] flex items-center justify-center">
                {/* Success checkmark icon */}
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="30" cy="30" r="30" fill="#E8F8F0"/>
                  <path d="M20 30L27 37L40 24" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              <div className="flex flex-col items-center gap-3">
                <h1 className="text-center text-[#212b36] text-base font-medium font-poppins w-[260px]">
                  Password successfully reset.
                </h1>
                <p className="text-center text-[#212b36] text-sm font-medium font-poppins w-[358px] max-w-full">
                  You can now log in to your account using your new password
                </p>
              </div>
            </div>

            {/* Login Button */}
            <Link href="/login" className="w-full">
              <button className="w-full h-12 rounded-[10px] bg-[#2c7be5] hover:bg-blue-600 text-white font-medium text-base font-inter transition-colors cursor-pointer">
                Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
