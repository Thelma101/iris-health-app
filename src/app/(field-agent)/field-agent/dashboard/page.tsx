'use client';

import { useState, useEffect, useCallback } from 'react';
import { fieldAgentApi } from '@/lib/api/field-agent';
import TestsStatCard from '@/components/field-agent/TestsStatCard';
import RecentRecordsTable from '@/components/field-agent/RecentRecordsTable';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface DashboardStats {
  totalTests: number;
  lastTestDate: string;
}

interface RecentRecord {
  id: string;
  community: string;
  totalTests: number;
  topPositiveTest: string;
  topNegativeTest: string;
}

export default function FieldAgentDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTests: 0,
    lastTestDate: '',
  });
  const [recentRecords, setRecentRecords] = useState<RecentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch visitations/tests for the field agent
      const [visitationsRes] = await Promise.all([
        fieldAgentApi.getMyVisitations(),
      ]) as any[];

      const visitations = visitationsRes.data?.data?.visitations || visitationsRes.data?.visitations || [];
      
      // Calculate stats
      const totalTests = visitations.length;
      const lastVisitation = visitations.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      setStats({
        totalTests,
        lastTestDate: lastVisitation?.createdAt 
          ? new Date(lastVisitation.createdAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            }).replace(',', '')
          : new Date().toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            }).replace(',', ''),
      });

      // Group visitations by community for recent records
      const communityMap = new Map<string, any>();
      visitations.forEach((v: any) => {
        const communityName = v.community?.name || v.communityName || 'Unknown';
        if (!communityMap.has(communityName)) {
          communityMap.set(communityName, {
            id: v._id || v.id,
            community: communityName,
            totalTests: 0,
            topPositiveTest: v.testType || 'HIV/AIDS',
            topNegativeTest: 'Hepatitis B',
          });
        }
        communityMap.get(communityName).totalTests++;
      });

      setRecentRecords(Array.from(communityMap.values()).slice(0, 15));
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
      
      // Set fallback demo data
      setStats({
        totalTests: 10000,
        lastTestDate: '23/06/25 6:00PM',
      });
      
      setRecentRecords([
        { id: '1', community: 'Baiyeku Ikorodu', totalTests: 679, topPositiveTest: 'HIV/AIDS', topNegativeTest: 'Hepatitis B' },
        { id: '2', community: 'Baiyeku Ikorodu', totalTests: 679, topPositiveTest: 'HIV/AIDS', topNegativeTest: 'Hepatitis B' },
        { id: '3', community: 'Baiyeku Ikorodu', totalTests: 679, topPositiveTest: 'HIV/AIDS', topNegativeTest: 'Hepatitis B' },
        { id: '4', community: 'Baiyeku Ikorodu', totalTests: 679, topPositiveTest: 'HIV/AIDS', topNegativeTest: 'Hepatitis B' },
        { id: '5', community: 'Baiyeku Ikorodu', totalTests: 679, topPositiveTest: 'HIV/AIDS', topNegativeTest: 'Hepatitis B' },
        { id: '6', community: 'Baiyeku Ikorodu', totalTests: 679, topPositiveTest: 'HIV/AIDS', topNegativeTest: 'Hepatitis B' },
        { id: '7', community: 'Baiyeku Ikorodu', totalTests: 679, topPositiveTest: 'HIV/AIDS', topNegativeTest: 'Hepatitis B' },
        { id: '8', community: 'Baiyeku Ikorodu', totalTests: 679, topPositiveTest: 'HIV/AIDS', topNegativeTest: 'Hepatitis B' },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#d9d9d9] rounded-tl-[20px] rounded-bl-[20px] overflow-hidden">
      <div className="p-6 flex flex-col gap-6">
        {/* Page Title */}
        <div 
          className="h-[50px] rounded-lg border-2 border-[#fff9e6] flex items-center px-4"
          style={{ 
            backgroundImage: 'linear-gradient(172.45deg, rgba(255, 249, 230, 1) 3.64%, rgba(232, 241, 255, 1) 100.8%)' 
          }}
        >
          <h1 className="font-poppins font-semibold text-xl text-[#212b36] uppercase">
            Dashboard
          </h1>
        </div>

        {/* Stats Card */}
        <TestsStatCard
          totalTests={stats.totalTests}
          lastTestDate={stats.lastTestDate}
        />

        {/* Recent Records Table */}
        <div className="flex flex-col gap-2.5">
          <p className="font-poppins text-sm text-[#637381]">Recent record</p>
          <RecentRecordsTable records={recentRecords} />
        </div>

        {error && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
            {error} - Showing demo data
          </div>
        )}
      </div>
    </div>
  );
}
