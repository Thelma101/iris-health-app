'use client';

import { useState, useEffect } from 'react';
import { fieldAgentApi } from '@/lib/api/field-agent';
import { classifyResult } from '@/lib/utils/resultClassifier';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface CommunityDetails {
  _id: string;
  name: string;
  lga: string;
  population: number;
  fieldOfficers: string[];
  totalTests: number;
  totalPatients: number;
  positiveCount: number;
  negativeCount: number;
  visitationDates: string[];
  visitationSummary: string;
  lastVisitDate: string;
}

export default function FieldAgentCommunityPage() {
  const [community, setCommunity] = useState<CommunityDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCommunity() {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch communities and patients in parallel
        const [commRes, patRes] = await Promise.all([
          fieldAgentApi.getMyCommunities() as any,
          fieldAgentApi.getPatients() as any,
        ]);

        const communities = commRes.data?.data?.communities || commRes.data?.communities || [];
        const allPatients = patRes.data?.data?.patients || patRes.data?.patients || [];
        
        if (communities.length > 0) {
          const c = communities[0];
          const communityId = c._id || c.id;

          // Parse field officers
          const officers = (c.fieldOfficers || []).map((fo: any) => {
            if (typeof fo === 'string') return fo;
            if (fo.firstName || fo.lastName) return `${fo.firstName || ''} ${fo.lastName || ''}`.trim();
            if (fo.name) return fo.name;
            return '';
          }).filter((name: string) => name);

          // Filter patients belonging to this community
          const communityPatients = allPatients.filter((p: any) => {
            const pComm = p.community?._id || p.community;
            return pComm === communityId;
          });

          // Compute test stats from patient testDetails
          let totalTests = 0;
          let positiveCount = 0;
          let negativeCount = 0;
          const testDatesSet = new Set<string>();

          communityPatients.forEach((p: any) => {
            const tests = p.testDetails || [];
            totalTests += tests.length;
            tests.forEach((t: any) => {
              const result = (t.testResult || '').toLowerCase().trim();
              const cls = classifyResult(result);
              if (cls === 'positive') positiveCount++;
              else if (cls === 'negative') negativeCount++;
              // Collect unique test dates
              const d = t.dateConducted || t.dateVisited;
              if (d) {
                const dateStr = new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                testDatesSet.add(dateStr);
              }
            });
          });

          // Use DB totalTestsConducted as fallback
          if (totalTests === 0 && c.totalTestsConducted > 0) {
            totalTests = c.totalTestsConducted;
          }

          // Sort visitation dates (most recent first)
          const visitationDates = Array.from(testDatesSet).sort((a, b) =>
            new Date(b).getTime() - new Date(a).getTime()
          );

          // Build auto-generated summary
          const lastDate = visitationDates[0] || (c.dateVisited ? new Date(c.dateVisited).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null);
          const dbSummary = c.visitationSummary;
          let summaryText = '';
          if (dbSummary) {
            summaryText = dbSummary;
          } else if (totalTests > 0) {
            summaryText = `${totalTests} test${totalTests !== 1 ? 's' : ''} conducted across ${communityPatients.length} patient${communityPatients.length !== 1 ? 's' : ''}. ${positiveCount} positive, ${negativeCount} negative.`;
            if (lastDate) summaryText += ` Last activity: ${lastDate}.`;
          } else {
            summaryText = 'No test activities recorded yet.';
          }

          setCommunity({
            _id: communityId,
            name: c.name || 'Unknown',
            lga: c.lga || 'N/A',
            population: c.totalPopulation || c.population || 0,
            fieldOfficers: officers,
            totalTests,
            totalPatients: communityPatients.length,
            positiveCount,
            negativeCount,
            visitationDates: visitationDates.slice(0, 10), // Show last 10 dates
            visitationSummary: summaryText,
            lastVisitDate: lastDate || 'N/A',
          });
        } else {
          setCommunity(null);
          setError('No community assigned to this field agent');
        }
      } catch {
        setCommunity(null);
        setError('Failed to load community data');
      } finally {
        setLoading(false);
      }
    }
    fetchCommunity();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="bg-white border border-[#d9d9d9] border-r-0 rounded-tl-[20px] rounded-bl-[20px] rounded-tr-none rounded-br-none overflow-hidden min-h-[calc(100vh-93px)]">
        <div className="p-4 sm:p-6 flex flex-col gap-4 sm:gap-6">
          <div 
            className="h-12 sm:h-[50px] rounded-lg border-2 border-[#fff9e6] flex items-center px-4"
            style={{ 
              backgroundImage: 'linear-gradient(172.45deg, rgba(255, 249, 230, 1) 3.64%, rgba(232, 241, 255, 1) 100.8%)' 
            }}
          >
            <h1 className="font-poppins font-semibold text-base sm:text-xl text-[#212b36] uppercase">
              Community
            </h1>
          </div>
          <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error || 'No community data available'}
          </div>
        </div>
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
          <h1 className="font-poppins font-semibold text-base sm:text-xl text-[#212b36] uppercase">
            Community
          </h1>
        </div>

        {/* Community Details Card */}
        {community && (
          <div className="bg-white rounded-[10px] border border-[#d9d9d9] overflow-hidden max-w-[466px]">
            {/* Header with Community Name */}
            <div className="h-12 bg-white border-b border-[#d9d9d9] flex items-center px-4 sm:px-[22px]">
              <p className="font-poppins font-medium text-lg sm:text-xl text-[#212b36]">
                {community.name}
              </p>
            </div>

            {/* Map Section */}
            <div className="h-[120px] sm:h-[152px] mx-4 sm:mx-[21px] mt-4 sm:mt-[23px] bg-white overflow-hidden rounded">
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-50 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[#e8f1ff] opacity-50" />
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <svg className="w-8 h-8 text-[#d64545]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span className="text-xs text-[#637381] font-poppins">{community.lga}</span>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="px-4 sm:px-[21px] py-4 sm:py-6 flex flex-col gap-6 sm:gap-7">
              {/* Population */}
              <div className="border-b border-[#d9d9d9] pb-2 flex flex-col gap-2.5">
                <p className="font-poppins font-semibold text-base text-[#212b36]">
                  Population
                </p>
                <p className="font-poppins text-sm text-[#212b36]">
                  {community.population > 0 ? community.population.toLocaleString() : 'Not yet recorded'}
                </p>
              </div>

              {/* LGA */}
              <div className="border-b border-[#d9d9d9] pb-2 flex flex-col gap-2.5">
                <p className="font-poppins font-semibold text-base text-[#212b36]">
                  LGA
                </p>
                <p className="font-poppins text-sm text-[#212b36]">
                  {community.lga}
                </p>
              </div>

              {/* Field Officers */}
              <div className="border-b border-[#d9d9d9] pb-2 flex flex-col gap-2.5">
                <p className="font-poppins font-semibold text-base text-[#212b36]">
                  Field Officers
                </p>
                <p className="font-poppins text-sm text-[#212b36]">
                  {community.fieldOfficers.length > 0
                    ? community.fieldOfficers.join(', ')
                    : 'No officers assigned'}
                </p>
              </div>

              {/* Total Tests Conducted */}
              <div className="border-b border-[#d9d9d9] pb-2 flex flex-col gap-2.5">
                <p className="font-poppins font-semibold text-base text-[#212b36]">
                  Total Tests Conducted
                </p>
                <p className="font-poppins text-sm text-[#212b36]">
                  {community.totalTests.toLocaleString()}
                </p>
              </div>

              {/* Patients Tested */}
              <div className="border-b border-[#d9d9d9] pb-2 flex flex-col gap-2.5">
                <p className="font-poppins font-semibold text-base text-[#212b36]">
                  Patients Tested
                </p>
                <p className="font-poppins text-sm text-[#212b36]">
                  {community.totalPatients.toLocaleString()}
                </p>
              </div>

              {/* Test Results Breakdown */}
              {community.totalTests > 0 && (
                <div className="border-b border-[#d9d9d9] pb-2 flex flex-col gap-2.5">
                  <p className="font-poppins font-semibold text-base text-[#212b36]">
                    Results Breakdown
                  </p>
                  <div className="flex gap-4">
                    <span className="font-poppins text-sm text-green-600">
                      +ve: {community.positiveCount}
                    </span>
                    <span className="font-poppins text-sm text-red-600">
                      -ve: {community.negativeCount}
                    </span>
                    <span className="font-poppins text-sm text-[#637381]">
                      Other: {community.totalTests - community.positiveCount - community.negativeCount}
                    </span>
                  </div>
                </div>
              )}

              {/* Visitation Summary */}
              <div className="border-b border-[#d9d9d9] pb-2 flex flex-col gap-2.5">
                <p className="font-poppins font-semibold text-base text-[#212b36]">
                  Visitation Summary
                </p>
                <p className="font-poppins text-sm text-[#212b36]">
                  {community.visitationSummary}
                </p>
              </div>

              {/* Visitation Dates */}
              {community.visitationDates.length > 0 && (
                <div className="border-b border-[#d9d9d9] pb-2 flex flex-col gap-2.5">
                  <p className="font-poppins font-semibold text-base text-[#212b36]">
                    Recent Activity Dates
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {community.visitationDates.map((date, index) => (
                      <span key={index} className="font-poppins text-xs text-[#637381] bg-[#f4f6f8] px-2 py-1 rounded">
                        {date}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
