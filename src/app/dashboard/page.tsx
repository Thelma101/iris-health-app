"use client";
import { useEffect, useState } from 'react';
import StatCard from '@/components/admin/StatCard';
import api, { DashboardStats, RecentRecord } from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    communities: 0,
    fieldAgents: 0,
    tests: 0,
    communitiesCovered: 0,
    fieldAgentsAvailable: 0,
    lastTestDate: '',
  });
  const [recentRecords, setRecentRecords] = useState<RecentRecord[]>([]);
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
        if (statsRes.data) {
          setStats(statsRes.data);
        }
        if (recentRes.data) {
          setRecentRecords(recentRes.data);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  return (
    <main className="space-y-4 sm:space-y-6">
      <section className="bg-white rounded-tl-[20px] rounded-bl-[20px] border border-[#d9d9d9]">
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Dashboard Header */}
          <div 
            className="w-full h-[50px] relative rounded-lg border-2 border-[#fff9e6] overflow-hidden flex items-center px-4 sm:px-[17px]"
            style={{
              backgroundImage: 'linear-gradient(172.45deg, rgba(255, 249, 230, 1) 3.64%, rgba(232, 241, 255, 1) 100.8%)',
            }}
          >
            <span className="text-base sm:text-xl font-semibold text-[#212b36] uppercase font-poppins">Dashboard</span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <LoadingSpinner />
              <p className="text-[#637381] text-sm font-poppins">Loading dashboard data...</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-[22px]">
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
                  subtitle={`${stats.tests.toLocaleString()} tests carried out as at ${stats.lastTestDate || 'N/A'}`}
                  progress={stats.tests > 0 ? 1 : 0}
                  progressColour="bg-[#d64545]"
                  cardBg="bg-[#fbeaea]"
                  iconSrc="/icons/tests-icon.png"
                />
              </div>

              {/* Recent Records Section */}
              <section className="space-y-2.5">
                <p className="text-[#637381] text-sm font-normal font-poppins">Recent record</p>
                <div className="rounded-lg border border-[#d9d9d9] overflow-hidden">
                  {/* Table Header */}
                  <div className="bg-[#f4f5f7] px-1 py-1.5 flex items-center gap-[114px] overflow-x-auto">
                    <div className="min-w-[211px] text-[#637381] text-sm font-semibold font-poppins px-1">Communities</div>
                    <div className="min-w-[143px] text-[#637381] text-sm font-semibold font-poppins">Total Test</div>
                    <div className="min-w-[202px] text-[#637381] text-sm font-semibold font-poppins">Top Tests +ve</div>
                    <div className="min-w-[188px] text-[#637381] text-sm font-semibold font-poppins hidden sm:block">Top Tests -ve</div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-[#e5e7eb]">
                    {recentRecords.length > 0 ? (
                      recentRecords.map((record, idx) => (
                        <div
                          key={`${record.community}-${idx}`}
                          className={`px-1 py-1.5 flex items-center gap-[114px] overflow-x-auto transition-colors hover:bg-gray-50 ${
                            idx % 2 === 1 ? 'bg-[#fcfdfd]' : 'bg-white'
                          }`}
                        >
                          <div className="min-w-[211px] text-[#637381] text-sm font-normal font-poppins px-1 truncate">
                            {record.community}
                          </div>
                          <div className="min-w-[143px] text-[#637381] text-sm font-normal font-poppins">
                            {record.totalTests}
                          </div>
                          <div className="min-w-[202px] text-[#637381] text-sm font-normal font-poppins">
                            {record.topPositiveTest}
                          </div>
                          <div className="min-w-[188px] text-[#637381] text-sm font-normal font-poppins hidden sm:block">
                            {record.topNegativeTest}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center py-8">
                        <p className="text-[#637381] text-sm font-poppins">No records available</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
