'use client';

export default function AdminPage() {
  return (
    <main className="bg-white border border-[#d9d9d9] border-r-0 rounded-bl-[20px] rounded-tl-[20px] w-full min-h-[calc(100vh-93px)] p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="h-12 sm:h-[50px] rounded-lg bg-gradient-to-r from-[#fff9e6] to-[#e8f1ff] border-2 border-[#fff9e6] flex items-center px-4 sm:px-5">
        <span className="text-base sm:text-xl font-semibold text-[#212b36] uppercase font-poppins">Admin</span>
      </div>

      <div className="bg-[#f4f5f7] rounded-lg border border-[#d9d9d9] p-6">
        <p className="text-[#637381] font-poppins">Admin dashboard content coming soon.</p>
      </div>
    </main>
  );
}
