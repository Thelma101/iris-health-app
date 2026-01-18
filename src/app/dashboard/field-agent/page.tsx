'use client';

import { useEffect, useState } from 'react';
import { fieldAgentApi } from '@/lib/api/field-agent';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Image from 'next/image';

interface AgentStats {
  tests: number;
  lastTestDate: string;
}

interface RecentRecord {
  community: string;
  totalTests: number;
  topPositiveTest: string;
  topNegativeTest: string;
}

export default function FieldAgentDashboard() {
  const [stats, setStats] = useState<AgentStats>({ tests: 0, lastTestDate: '' });
  const [recentRecords, setRecentRecords] = useState<RecentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch field agent dashboard stats
        const response = await fieldAgentApi.getDashboardStats();
        if (response.success && response.data) {
          const data = response.data;
          setStats({
            tests: data.totalTests || 0,
            lastTestDate: data.lastTestDate || new Date().toLocaleDateString('en-GB', {
              day: '2-digit', month: '2-digit', year: '2-digit'
            }) + ' ' + new Date().toLocaleTimeString('en-US', {
              hour: 'numeric', minute: '2-digit', hour12: true
            })
          });
        }
      } catch (err) {
        console.error('Failed to fetch agent data:', err);
        // Use default values if API fails
        setStats({
          tests: 0,
          lastTestDate: new Date().toLocaleDateString('en-GB', {
            day: '2-digit', month: '2-digit', year: '2-digit'
          }) + ' ' + new Date().toLocaleTimeString('en-US', {
            hour: 'numeric', minute: '2-digit', hour12: true
          })
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const progressPercentage = stats.tests > 0 ? Math.min((stats.tests / 100) * 100, 100) : 0;

  return (
    <main className="space-y-4 sm:space-y-6">
      <section className="bg-white rounded-tl-[20px] rounded-bl-[20px] border border-[#d9d9d9]">
        <div className="p-4 sm:p-6 space-y-5 sm:space-y-[22px]">
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
            <div className="flex flex-col gap-10">
              {/* Tests Card - Figma 169:3545 */}
              <div className="flex items-center">
                <div className="bg-[#fbeaea] rounded-[10px] px-5 py-3 flex flex-col gap-4 w-full max-w-[445px]">
                  {/* Title */}
                  <p className="text-[#212b36] text-base font-medium font-poppins">
                    Tests
                  </p>
                  
                  {/* Stats Row */}
                  <div className="flex items-center justify-between gap-[88px]">
                    <div className="flex flex-col w-[261px]">
                      <p className="text-[#212b36] text-[32px] font-semibold font-poppins">
                        {stats.tests.toLocaleString()}
                      </p>
                      <p className="text-[#637381] text-xs font-normal font-poppins">
                        {stats.tests.toLocaleString()} tests carried out as at {stats.lastTestDate}
                      </p>
                    </div>
                    
                    {/* Test Vial Icon */}
                    <div className="bg-white rounded-[30px] size-[45px] flex items-center justify-center overflow-hidden flex-shrink-0">
                      <Image 
                        src="/icons/community1.svg"
                        alt="Tests" 
                        width={29} 
                        height={29}
                        className="object-contain"
                      />
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="bg-white h-[14px] rounded-lg overflow-hidden w-full">
                    <div 
                      className="bg-[#d64545] h-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Recent Records Section */}
              <section className="flex flex-col gap-2.5">
                <p className="text-[#637381] text-sm font-normal font-poppins">Recent record</p>
              
                <div className="rounded-lg border border-[#d9d9d9] overflow-hidden">
                  {/* Table Header */}
                  <div className="bg-[#f4f5f7] px-1 py-1.5 flex items-center overflow-x-auto">
                    <div className="min-w-[211px] w-[211px] text-[#637381] text-sm font-semibold font-poppins px-1">Communities</div>
                    <div className="min-w-[143px] w-[143px] text-[#637381] text-sm font-semibold font-poppins ml-[114px]">Total Test</div>
                    <div className="min-w-[202px] w-[202px] text-[#637381] text-sm font-semibold font-poppins ml-[114px]">Top Tests +ve</div>
                    <div className="min-w-[188px] w-[188px] text-[#637381] text-sm font-semibold font-poppins ml-[114px] hidden sm:block">Top Tests -ve</div>
                  </div>

                  {/* Table Body */}
                  <div className="flex flex-col gap-1">
                    {recentRecords.length > 0 ? (
                      recentRecords.map((record, idx) => (
                        <div
                          key={`${record.community}-${idx}`}
                          className={`px-1 py-1.5 flex items-center overflow-x-auto transition-colors border-b border-[#e5e7eb] ${
                            idx % 2 === 1 ? 'bg-[#fcfdfd]' : 'bg-white'
                          }`}
                        >
                          <div className="min-w-[211px] w-[211px] text-[#637381] text-sm font-normal font-poppins px-1 truncate">
                            {record.community}
                          </div>
                          <div className="min-w-[143px] w-[143px] text-[#637381] text-sm font-normal font-poppins ml-[114px]">
                            {record.totalTests}
                          </div>
                          <div className="min-w-[202px] w-[202px] text-[#637381] text-sm font-normal font-poppins ml-[114px]">
                            {record.topPositiveTest}
                          </div>
                          <div className="min-w-[188px] w-[188px] text-[#637381] text-sm font-normal font-poppins ml-[114px] hidden sm:block">
                            {record.topNegativeTest}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center py-8">
                        <p className="text-[#637381] text-sm font-poppins">No records found</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
