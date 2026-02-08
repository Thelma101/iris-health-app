'use client';

import { useState, useEffect, useRef } from 'react';
import { fieldAgentApi } from '@/lib/api/field-agent';
import TestsStatCard from '@/components/field-agent/TestsStatCard';
import RecentRecordsTable from '@/components/field-agent/RecentRecordsTable';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { logger } from '@/lib/utils/logger';
import { classifyResult } from '@/lib/utils/resultClassifier';

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
        // Fetch communities and patients to compute stats from testDetails
        const [communitiesRes, patientsRes] = await Promise.all([
          fieldAgentApi.getMyCommunities(),
          fieldAgentApi.getPatients(),
        ]);

        const commData = communitiesRes.data as any;
        const patData = patientsRes.data as any;
        const communities = commData?.data?.communities || commData?.communities || [];
        const patients = patData?.data?.patients || patData?.patients || [];

        const duration = Math.round(performance.now() - startTime);
        logger.info('FieldAgentDashboard', `Data loaded (${duration}ms)`, { communities: communities.length, patients: patients.length });

        // Build a set of community IDs for quick lookup
        const communityIds = new Set(communities.map((c: any) => c._id || c.id));

        // Filter patients belonging to the agent's communities
        const agentPatients = patients.filter((p: any) => {
          const commId = p.community?._id || p.community;
          return commId && communityIds.has(commId);
        });

        // Count total tests and find latest test date from patient testDetails
        let totalTests = 0;
        let latestDate = '';
        agentPatients.forEach((p: any) => {
          const tests = p.testDetails || [];
          totalTests += tests.length;
          tests.forEach((t: any) => {
            const d = t.dateConducted || t.dateVisited;
            if (d && (!latestDate || new Date(d) > new Date(latestDate))) {
              latestDate = d;
            }
          });
        });

        // If no test dates found from testDetails, try community totalTestsConducted
        if (totalTests === 0) {
          totalTests = communities.reduce((sum: number, c: any) => sum + (c.totalTestsConducted || 0), 0);
        }

        setStats({
          totalTests,
          lastTestDate: latestDate
            ? new Date(latestDate).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            }).replace(',', '')
            : 'N/A',
        });

        // Group patients by community for recent records
        // Track positive/negative test counts per community
        const communityMap = new Map<string, any>();

        // Initialize from communities list
        communities.forEach((c: any) => {
          const communityName = c.name || 'Unknown';
          const communityLga = c.lga || '';
          const fullCommunityName = communityLga ? `${communityName} ${communityLga}` : communityName;
          const cId = c._id || c.id;

          communityMap.set(cId, {
            id: cId,
            community: fullCommunityName,
            totalTests: 0,
            positiveTests: {} as Record<string, number>,
            negativeTests: {} as Record<string, number>,
            topPositiveTest: '-',
            topNegativeTest: '-',
          });
        });

        // Aggregate test data from patients
        agentPatients.forEach((p: any) => {
          const commId = p.community?._id || p.community;
          if (!commId || !communityMap.has(commId)) return;

          const entry = communityMap.get(commId);
          const tests = p.testDetails || [];

          tests.forEach((t: any) => {
            entry.totalTests++;

            const testName = typeof t.testType === 'object' ? t.testType?.name : t.testType || 'Unknown';
            const result = (t.testResult || '').toLowerCase().trim();

            const resultClass = classifyResult(result);
            if (resultClass === 'positive') {
              entry.positiveTests[testName] = (entry.positiveTests[testName] || 0) + 1;
            } else if (resultClass === 'negative') {
              entry.negativeTests[testName] = (entry.negativeTests[testName] || 0) + 1;
            }
          });
        });

        // Use community.totalTestsConducted as fallback for communities with no patient data
        communities.forEach((c: any) => {
          const cId = c._id || c.id;
          const entry = communityMap.get(cId);
          if (entry && entry.totalTests === 0 && c.totalTestsConducted > 0) {
            entry.totalTests = c.totalTestsConducted;
          }
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

        // Only show communities that have tests
        const records = Array.from(communityMap.values())
          .filter((r) => r.totalTests > 0)
          .slice(0, 15);

        setRecentRecords(records);
        logger.info('FieldAgentDashboard', 'Dashboard data processed', { totalTests, communities: records.length });
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
