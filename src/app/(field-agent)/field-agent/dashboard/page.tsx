'use client';

import { useState, useEffect, useRef } from 'react';
import { fieldAgentApi } from '@/lib/api/field-agent';
import TestsStatCard from '@/components/field-agent/TestsStatCard';
import RecentRecordsTable from '@/components/field-agent/RecentRecordsTable';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { logger } from '@/lib/utils/logger';

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
  const hasFetched = useRef(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalTests: 0,
    lastTestDate: '',
  });
  const [recentRecords, setRecentRecords] = useState<RecentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    
    async function fetchDashboardData() {
      setLoading(true);
      setError(null);
      logger.info('FieldAgentDashboard', 'Fetching dashboard data');
      const startTime = performance.now();

      try {
        // Fetch visitations/tests for the field agent
        const visitationsRes = await fieldAgentApi.getMyVisitations() as any;

        const visitations = visitationsRes.data?.data?.visitations || visitationsRes.data?.visitations || [];
        const duration = Math.round(performance.now() - startTime);
        logger.info('FieldAgentDashboard', `Visitations loaded (${duration}ms)`, { count: visitations.length });

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
          : 'N/A',
      });

      // Group visitations by community for recent records
      // Track positive/negative test counts per community
      const communityMap = new Map<string, any>();
      visitations.forEach((v: any) => {
        // Backend populates communityId with { name, lga } object
        const communityName = v.communityId?.name || v.community?.name || v.communityName || 'Unknown';
        const communityLga = v.communityId?.lga || v.community?.lga || '';
        const fullCommunityName = communityLga ? `${communityName} ${communityLga}` : communityName;

        if (!communityMap.has(fullCommunityName)) {
          communityMap.set(fullCommunityName, {
            id: v._id || v.id,
            community: fullCommunityName,
            totalTests: 0,
            positiveTests: {} as Record<string, number>,
            negativeTests: {} as Record<string, number>,
            topPositiveTest: '-',
            topNegativeTest: '-',
          });
        }

        const entry = communityMap.get(fullCommunityName);
        entry.totalTests++;

        // Aggregate diagnostics to find top positive/negative tests
        // Diagnostics can be plain strings like "Malaria RDT - Positive" or objects with {testType, result}
        const diagnostics = v.diagnostics || [];
        diagnostics.forEach((d: any) => {
          let testName = 'Unknown';
          let result = '';

          if (typeof d === 'string') {
            // Parse string format: "TestName - Result"
            const separatorIdx = d.lastIndexOf(' - ');
            if (separatorIdx > 0) {
              testName = d.substring(0, separatorIdx).trim();
              result = d.substring(separatorIdx + 3).trim().toLowerCase();
            } else {
              testName = d;
            }
          } else {
            // Object format: { testType, result }
            testName = typeof d.testType === 'object' ? d.testType?.name : d.testType || 'Unknown';
            result = (d.result || d.testResult || '').toLowerCase();
          }

          if (result.includes('positive') || result === 'reactive') {
            entry.positiveTests[testName] = (entry.positiveTests[testName] || 0) + 1;
          } else if (result.includes('negative') || result === 'non-reactive') {
            entry.negativeTests[testName] = (entry.negativeTests[testName] || 0) + 1;
          }
        });
      });

      // Compute top positive/negative from aggregated data
      communityMap.forEach((entry) => {
        const topPos = Object.entries(entry.positiveTests as Record<string, number>).sort((a, b) => b[1] - a[1])[0];
        const topNeg = Object.entries(entry.negativeTests as Record<string, number>).sort((a, b) => b[1] - a[1])[0];
        entry.topPositiveTest = topPos ? `${topPos[0]} (${topPos[1]})` : '-';
        entry.topNegativeTest = topNeg ? `${topNeg[0]} (${topNeg[1]})` : '-';
        // Clean up intermediate data
        delete entry.positiveTests;
        delete entry.negativeTests;
      });

      setRecentRecords(Array.from(communityMap.values()).slice(0, 15));
      logger.info('FieldAgentDashboard', 'Dashboard data processed', { totalTests: visitations.length, communities: communityMap.size });
    } catch (err: any) {
      logger.error('FieldAgentDashboard', 'Error fetching dashboard data', { error: err?.message || err });
      setError('Failed to load dashboard data');

      // Empty state on error - no fallback data
      setStats({
        totalTests: 0,
        lastTestDate: 'N/A',
      });

      setRecentRecords([]);
    } finally {
      setLoading(false);
    }
    }
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#d9d9d9] border-r-0 rounded-tl-[20px] rounded-bl-[20px] rounded-tr-none rounded-br-none overflow-hidden min-h-[calc(100vh-93px)]">
      <div className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
        {/* Page Title */}
        <div
          className="h-12 sm:h-[50px] rounded-lg border-2 border-[#fff9e6] flex items-center px-4"
          style={{
            backgroundImage: 'linear-gradient(172.45deg, rgba(255, 249, 230, 1) 3.64%, rgba(232, 241, 255, 1) 100.8%)'
          }}
        >
          <h1 className="font-poppins font-semibold text-lg sm:text-xl text-[#212b36] uppercase">
            Dashboard
          </h1>
        </div>

        {/* Stats Card */}
        <div className="max-w-md">
          <TestsStatCard
            totalTests={stats.totalTests}
            lastTestDate={stats.lastTestDate}
          />
        </div>

        {/* Recent Records Table */}
        <div className="flex flex-col gap-2.5">
          <p className="font-poppins text-sm text-[#637381]">Recent record</p>
          <RecentRecordsTable records={recentRecords} />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
