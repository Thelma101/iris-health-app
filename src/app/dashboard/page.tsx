
"use client";
import { useEffect, useState } from 'react';
import StatCard from '@/components/ui/StatCard';
import api from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    communities: 0,
    fieldAgents: 0,
    tests: 0,
    communitiesCovered: 0,
    fieldAgentsAvailable: 0,
    lastTestDate: '',
  });
  const [recentRecords, setRecentRecords] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch stats and recent records from API
        const [statsRes, recentRes] = await Promise.all([
          api.getDashboardStats(),
          api.getRecentCommunityRecords(),
        ]);
        setStats(statsRes.data as typeof stats);
        setRecentRecords(recentRes.data as any[]);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  return (
    <main className="space-y-4 sm:space-y-6">
      <section className="bg-white rounded-tl-[20px] rounded-bl-[20px] border border-zinc-300">
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="w-full h-[50px] relative rounded-lg bg-gradient-to-r from-[#fff9e6] to-[#e8f1ff] border-2 border-[#fff9e6] box-border overflow-hidden shrink-0 text-left font-poppins flex items-center px-4 sm:px-[19px]">
            <span className="text-base sm:text-lg font-semibold text-[#212b36] uppercase">Dashboard</span>
          </div>

          {error && <div className="text-red-500">{error}</div>}
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                <StatCard
                  title="Communities"
                  value={stats.communities}
                  subtitle={`${stats.communitiesCovered} communities Covered`}
                  progress={stats.communitiesCovered / (stats.communities || 1)}
                  progressColour="bg-[#00c897]"
                  cardBg="bg-[#dffbf5]"
                  iconSrc="/icons/communities-icon.png"
                />
                <StatCard
                  title="Field Agents"
                  value={stats.fieldAgents}
                  subtitle={`${stats.fieldAgentsAvailable} Field agents available`}
                  progress={stats.fieldAgentsAvailable / (stats.fieldAgents || 1)}
                  progressColour="bg-[#f4a100]"
                  cardBg="bg-[#fff9e6]"
                  iconSrc="/icons/field-agents-icon.png"
                />
                <StatCard
                  title="Tests"
                  value={stats.tests.toLocaleString()}
                  subtitle={`${stats.tests.toLocaleString()} tests carried out as at ${stats.lastTestDate}`}
                  progress={1}
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
                  {recentRecords.map((r: any, idx: number) => (
                    <div
                      key={`${r.community}-${idx}`}
                      className={`min-w-[320px] sm:min-w-[720px] px-2 sm:px-1 py-1.5 flex items-center gap-2 sm:gap-6 md:gap-16 lg:gap-28 border-b border-gray-200 ${idx % 2 === 1 ? 'bg-[#fcfdfd]' : 'bg-white'}`}
                    >
                      <div className="w-32 sm:w-52 text-gray-500 text-xs sm:text-sm font-normal font-poppins truncate">{r.community}</div>
                      <div className="w-20 sm:w-36 text-gray-500 text-xs sm:text-sm font-normal font-poppins">{r.totalTests}</div>
                      <div className="w-32 sm:w-52 text-gray-500 text-xs sm:text-sm font-normal font-poppins">{r.topPositiveTest}</div>
                      <div className="hidden sm:block w-48 text-gray-500 text-xs sm:text-sm font-normal font-poppins">{r.topNegativeTest}</div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
