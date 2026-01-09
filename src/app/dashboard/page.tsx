import StatCard from '@/components/ui/StatCard';

export default function DashboardPage() {
  return (
    <main className="space-y-4 sm:space-y-6">
      <section className="bg-white rounded-tl-[20px] rounded-bl-[20px] border border-zinc-300">
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="w-full h-[50px] relative rounded-lg bg-gradient-to-r from-[#fff9e6] to-[#e8f1ff] border-2 border-[#fff9e6] box-border overflow-hidden shrink-0 text-left font-poppins flex items-center px-4 sm:px-[19px]">
            <span className="text-base sm:text-lg font-semibold text-[#212b36] uppercase">Dashboard</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            <StatCard
              title="Communities"
              value={56}
              subtitle="30 communities  Covered "
              progress={0.45}
              progressColour="bg-[#00c897]"
              cardBg="bg-[#dffbf5]"
              iconSrc="/icons/communities-icon.png"
            />

            <StatCard
              title="Field Agents"
              value={80}
              subtitle="30 Field agents available "
              progress={0.45}
              progressColour="bg-[#f4a100]"
              cardBg="bg-[#fff9e6]"
              iconSrc="/icons/field-agents-icon.png"
            />

            <StatCard
              title="Tests"
              value="10,000"
              subtitle="10,000 tests carried out as at 23/06/25 6:00PM"
              progress={0.45}
              progressColour="bg-[#d64545]"
              cardBg="bg-[#fbeaea]"
              iconSrc="/icons/tests-icon.png"
              fullWidth
            />
          </div>

          <section className="space-y-2.5">
            <div className="text-gray-500 text-sm font-normal font-poppins">Recent record</div>
            <div className="rounded-lg border border-zinc-300 overflow-x-auto">
              <div className="min-w-[320px] sm:min-w-[720px] px-2 sm:px-1 py-1.5 bg-gray-100 flex items-center gap-2 sm:gap-6 md:gap-16 lg:gap-28">
                <div className="w-32 sm:w-52 text-gray-500 text-xs sm:text-sm font-semibold font-poppins">Communities</div>
                <div className="w-20 sm:w-36 text-gray-500 text-xs sm:text-sm font-semibold font-poppins">Total Test</div>
                <div className="w-32 sm:w-52 text-gray-500 text-xs sm:text-sm font-semibold font-poppins">Top Tests +ve</div>
                <div className="hidden sm:block w-48 text-gray-500 text-xs sm:text-sm font-semibold font-poppins">Top Tests -ve</div>
              </div>
              {(
                [
                  { c: 'Tee George Community', t: 892, p: 'Malaria', n: 'Typhoid' },
                  { c: 'Green Lunar District', t: 756, p: 'HIV/AIDS', n: 'Hepatitis B' },
                  { c: 'Baiyeku Ikorodu', t: 679, p: 'HIV/AIDS', n: 'Hepatitis B' },
                  { c: 'Balogun Agege', t: 678, p: 'HIV/AIDS', n: 'Hepatitis B' },
                  { c: 'Awori Alimosho', t: 541, p: 'Malaria', n: 'HIV/AIDS' },
                  { c: 'Ikorodu Central', t: 423, p: 'Typhoid', n: 'Malaria' },
                  { c: 'Epe Marina', t: 367, p: 'Hepatitis C', n: 'HIV/AIDS' },
                  { c: 'Badagry Beach', t: 298, p: 'Tuberculosis', n: 'Malaria' },
                  { c: 'Agege Stadium', t: 234, p: 'Blood Pressure', n: 'Blood Sugar' },
                ] as const
              ).map((r, idx) => (
                <div
                  key={`${r.c}-${idx}`}
                  className={`min-w-[320px] sm:min-w-[720px] px-2 sm:px-1 py-1.5 flex items-center gap-2 sm:gap-6 md:gap-16 lg:gap-28 border-b border-gray-200 ${idx % 2 === 1 ? 'bg-[#fcfdfd]' : 'bg-white'}`}
                >
                  <div className="w-32 sm:w-52 text-gray-500 text-xs sm:text-sm font-normal font-poppins truncate">{r.c}</div>
                  <div className="w-20 sm:w-36 text-gray-500 text-xs sm:text-sm font-normal font-poppins">{r.t}</div>
                  <div className="w-32 sm:w-52 text-gray-500 text-xs sm:text-sm font-normal font-poppins">{r.p}</div>
                  <div className="hidden sm:block w-48 text-gray-500 text-xs sm:text-sm font-normal font-poppins">{r.n}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
