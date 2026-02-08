'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import StatCard from './StatCard';
import api from '@/lib/api/index';

interface MobileDashboardProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface CommunityRecord {
  community: string;
  totalTests: number;
  topPositiveTest: string;
  topNegativeTest: string;
}

interface DashboardStats {
  communities: number;
  fieldAgents: number;
  totalTests: number;
  communitiesCovered: number;
  fieldAgentsAvailable: number;
  lastTestDate: string;
}

export default function MobileDashboard({ isOpen = false, onClose }: MobileDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    communities: 0,
    fieldAgents: 0,
    totalTests: 0,
    communitiesCovered: 0,
    fieldAgentsAvailable: 0,
    lastTestDate: '',
  });
  const [records, setRecords] = useState<CommunityRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!isOpen) return;
    
    setLoading(true);
    try {
      // Fetch communities
      const communitiesRes = await api.getCommunities();
      const communitiesData = communitiesRes.data as any;
      const communities = communitiesData?.data?.communities || communitiesData?.communities || [];
      
      // Fetch field agents
      const agentsRes = await api.getFieldAgents();
      const agentsData = agentsRes.data as any;
      const agents = agentsData?.data || agentsData?.fieldAgents || [];
      
      // Fetch patients for test counts
      const patientsRes = await api.getPatients();
      const patientsData = patientsRes.data as any;
      const patients = patientsData?.data?.patients || patientsData?.patients || [];
      
      // Calculate total tests
      let totalTests = 0;
      let lastTestDate = '';
      const communityMap = new Map<string, CommunityRecord>();
      
      patients.forEach((patient: any) => {
        const tests = patient.testDetails || [];
        totalTests += tests.length;
        
        tests.forEach((test: any) => {
          const communityName = patient.community?.name || patient.community || 'Unknown';
          
          if (!communityMap.has(communityName)) {
            communityMap.set(communityName, {
              community: communityName,
              totalTests: 0,
              topPositiveTest: test.testType?.name || test.testType || 'N/A',
              topNegativeTest: 'N/A',
            });
          }
          const record = communityMap.get(communityName)!;
          record.totalTests++;
          
          // Track last test date
          if (test.dateVisited && test.dateVisited > lastTestDate) {
            lastTestDate = test.dateVisited;
          }
        });
      });
      
      setStats({
        communities: communities.length,
        fieldAgents: agents.length,
        totalTests,
        communitiesCovered: communityMap.size,
        fieldAgentsAvailable: agents.filter((a: any) => a.status === 'active').length || agents.length,
        lastTestDate: lastTestDate ? new Date(lastTestDate).toLocaleString() : 'N/A',
      });
      
      setRecords(Array.from(communityMap.values()).slice(0, 10));
    } catch (err) {
      console.error('Error fetching mobile dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close dashboard"
      />

      {/* Mobile Dashboard Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white rounded-tl-3xl rounded-bl-3xl overflow-y-auto">
        {/* Close Button */}
        <div className="flex justify-end p-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <Image src="/icons/cancel-01.svg" alt="Close" width={24} height={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Dashboard Header */}
          <div className="w-full h-[50px] rounded-lg bg-gradient-to-r from-[#fff9e6] to-[#e8f1ff] border-2 border-[#fff9e6] flex items-center px-5">
            <span className="text-lg font-semibold text-[#212b36] uppercase">Dashboard</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="space-y-5">
                <StatCard
                  title="Communities"
                  value={stats.communities}
                  subtitle={`${stats.communitiesCovered} communities Covered`}
                  progress={stats.communities > 0 ? stats.communitiesCovered / stats.communities : 0}
                  progressColour="bg-[#00c897]"
                  cardBg="bg-[#dffbf5]"
                  iconSrc="/icons/communities-icon.png"
                />

                <StatCard
                  title="Field Agents"
                  value={stats.fieldAgents}
                  subtitle={`${stats.fieldAgentsAvailable} Field agents available`}
                  progress={stats.fieldAgents > 0 ? stats.fieldAgentsAvailable / stats.fieldAgents : 0}
                  progressColour="bg-[#f4a100]"
                  cardBg="bg-[#fff9e6]"
                  iconSrc="/icons/field-agents-icon.png"
                />

                <StatCard
                  title="Tests"
                  value={stats.totalTests.toLocaleString()}
                  subtitle={`${stats.totalTests.toLocaleString()} tests carried out${stats.lastTestDate !== 'N/A' ? ` as at ${stats.lastTestDate}` : ''}`}
                  progress={0.45}
                  progressColour="bg-[#d64545]"
                  cardBg="bg-[#fbeaea]"
                  iconSrc="/icons/tests-icon.png"
                />
              </div>

              {/* Recent Record */}
              <div className="space-y-4">
                <h3 className="text-sm font-normal text-gray-500">Recent record</h3>

                {/* Record Cards - Stacked for mobile */}
                <div className="space-y-4">
                  {records.length === 0 ? (
                    <p className="text-sm text-gray-500">No records found</p>
                  ) : (
                    records.map((record, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 px-4 py-2">
                          <p className="text-sm font-semibold text-gray-600">Communities</p>
                        </div>
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm text-gray-500">{record.community}</p>
                        </div>

                        <div className="bg-gray-100 px-4 py-2 border-t border-gray-100">
                          <p className="text-sm font-semibold text-gray-600">Total Test</p>
                        </div>
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm text-gray-500">{record.totalTests}</p>
                        </div>

                        <div className="bg-gray-100 px-4 py-2 border-t border-gray-100">
                          <p className="text-sm font-semibold text-gray-600">Top Tests +ve</p>
                        </div>
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm text-gray-500">{record.topPositiveTest}</p>
                        </div>

                        <div className="bg-gray-100 px-4 py-2 border-t border-gray-100">
                          <p className="text-sm font-semibold text-gray-600">Top Tests -ve</p>
                        </div>
                        <div className="px-4 py-2">
                          <p className="text-sm text-gray-500">{record.topNegativeTest}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
