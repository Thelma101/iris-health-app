'use client';

export default function AdminPage() {
  return (
    <main className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="h-12 sm:h-[50px] rounded-lg bg-gradient-to-r from-[#fff9e6] to-[#e8f1ff] border-2 border-[#fff9e6] flex items-center px-4 sm:px-5">
        <span className="text-base sm:text-xl font-semibold text-[#212b36] uppercase font-poppins">Admin</span>
      </div>

      <div className="bg-white rounded-lg border border-[#d9d9d9] p-6">
        <p className="text-[#637381] font-poppins">Admin dashboard content coming soon.</p>
      </div>
    </main>
  );
}
