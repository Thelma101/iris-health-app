'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AnalyticsFilters from '@/components/admin/analytics/AnalyticsFilters';
import CasesPerCommunity from '@/components/admin/analytics/CasesPerCommunity';
import RatePerType from '@/components/admin/analytics/RatePerType';
import FieldOfficerReport from '@/components/admin/analytics/FieldOfficerReport';
import OfficerTestListModal, { PatientTestRecord } from '@/components/admin/OfficerTestListModal';
import OfficerTestDetailsModal from '@/components/admin/OfficerTestDetailsModal';
import api from '@/lib/api/index';
import { calculateBMI } from '@/lib/utils/bmiCalculator';
import { generatePatientReportPDF, generateCommunityReportPDF, formatDate } from '@/lib/utils/generatePDF';

interface CommunityStats {
  id: string;
  name: string;
  lga: string;
  totalPatients: number;
  totalTests: number;
  positiveTests: number;
  negativeTests: number;
  assignedAgents: number;
  agentNames: string[];
}

export default function ReportPage() {
  // Initialize with empty date - shows all data by default
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [selectedTestType, setSelectedTestType] = useState('');
  const [showOfficerTestsModal, setShowOfficerTestsModal] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<{ id: string; name: string } | null>(null);
  const [showTestDetailsModal, setShowTestDetailsModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientTestRecord | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [bulkDownloadLoading, setBulkDownloadLoading] = useState(false);
  
  // Community summary stats
  const [communityStats, setCommunityStats] = useState<CommunityStats[]>([]);
  const [communityStatsLoading, setCommunityStatsLoading] = useState(true);
  
  // Chart data states
  const [casesData, setCasesData] = useState<Array<{ label: string; value: number }>>([]);
  const [rateData, setRateData] = useState<Array<{ label: string; value: number; color: string }>>([]);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [bmiLoading, setBmiLoading] = useState(true);
  const [bmiStats, setBmiStats] = useState<{
    average: number;
    total: number;
    counts: Record<string, number>;
  }>({
    average: 0,
    total: 0,
    counts: {
      Underweight: 0,
      Normal: 0,
      Overweight: 0,
      Obese: 0,
      Unknown: 0,
    },
  });
  const [ageRangeBmiData, setAgeRangeBmiData] = useState<Array<{ range: string; avgBmi: number; count: number }>>([]);

  // Fetch filtered chart data
  const fetchChartData = useCallback(async () => {
    setChartsLoading(true);
    try {
      // Build query params based on filters
      const params: Record<string, string> = {};
      if (selectedCommunity) params.communityId = selectedCommunity;
      if (selectedTestType) params.testType = selectedTestType;
      if (selectedDate) {
        // Convert DD/MM/YYYY to ISO date
        const parts = selectedDate.split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          const fullYear = year.length === 2 ? `20${year}` : year;
          params.date = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }

      // Fetch cases per community
      const casesRes = await api.getCasesPerCommunity(params);
      if (casesRes?.success && Array.isArray(casesRes.data)) {
        setCasesData(casesRes.data);
      }

      // Fetch rate per type — now returns test type distribution
      const rateRes = await api.getTestRatePerType(params);
      if (rateRes?.success && rateRes.data) {
        const colors = ['#3B82F6', '#F97316', '#10B981', '#8B5CF6', '#EF4444', '#F59E0B', '#06B6D4', '#EC4899', '#6366F1', '#14B8A6'];
        const distribution = rateRes.data.distribution || [];
        if (distribution.length > 0) {
          const rateDataArray = distribution.slice(0, 6).map((d: { type: string; count: number; percentage: number }, i: number) => ({
            label: d.type,
            value: d.percentage,
            color: colors[i % colors.length],
          }));
          setRateData(rateDataArray);
        } else {
          // Fallback to positive/negative if no distribution
          setRateData([
            { label: 'Positive', value: rateRes.data.positivePercentage, color: '#F97316' },
            { label: 'Negative', value: rateRes.data.negativePercentage, color: '#3B82F6' },
          ]);
        }
      }
    } catch (err) {
      console.error('[ReportPage] Error fetching chart data:', err);
    } finally {
      setChartsLoading(false);
    }
  }, [selectedCommunity, selectedTestType, selectedDate]);

  const fetchBmiStats = useCallback(async () => {
    setBmiLoading(true);
    try {
      const res = await api.getPatients({ limit: 1000 });
      const patientsData = res?.data as any;
      const patients = patientsData?.data?.patients || patientsData?.patients || [];

      let total = 0;
      let sum = 0;
      const counts: Record<string, number> = {
        Underweight: 0,
        Normal: 0,
        Overweight: 0,
        Obese: 0,
        Unknown: 0,
      };

      patients.forEach((patient: any) => {
        const tests = patient?.testDetails || [];
        if (!Array.isArray(tests) || tests.length === 0) return;

        const latestTest = [...tests].sort(
          (a, b) => new Date(b.dateConducted).getTime() - new Date(a.dateConducted).getTime()
        )[0];

        const bmiValue = typeof latestTest?.bmi === 'number' ? latestTest.bmi : null;
        const bmiCategory = latestTest?.bmiCategory;
        const computed = !bmiValue ? calculateBMI(latestTest?.weightKg, latestTest?.heightCm) : null;

        const bmi = bmiValue || computed?.bmi || null;
        const category = bmiCategory || computed?.category || 'Unknown';

        if (bmi) {
          total += 1;
          sum += bmi;
          counts[category] = (counts[category] || 0) + 1;
        } else {
          counts.Unknown += 1;
        }
      });

      // Compute age-range vs BMI data
      const ageRanges = [
        { label: '0-18', min: 0, max: 18 },
        { label: '19-30', min: 19, max: 30 },
        { label: '31-45', min: 31, max: 45 },
        { label: '46-60', min: 46, max: 60 },
        { label: '61+', min: 61, max: Infinity },
      ];
      const ageGroups: Record<string, { sum: number; count: number }> = {};
      ageRanges.forEach(r => { ageGroups[r.label] = { sum: 0, count: 0 }; });

      patients.forEach((patient: any) => {
        const age = parseInt(patient?.age, 10);
        if (isNaN(age)) return;

        const tests = patient?.testDetails || [];
        if (!Array.isArray(tests) || tests.length === 0) return;

        const latestTest = [...tests].sort(
          (a, b) => new Date(b.dateConducted).getTime() - new Date(a.dateConducted).getTime()
        )[0];

        const bmiValue = typeof latestTest?.bmi === 'number' ? latestTest.bmi : null;
        const computed = !bmiValue ? calculateBMI(latestTest?.weightKg, latestTest?.heightCm) : null;
        const bmi = bmiValue || computed?.bmi || null;
        if (!bmi) return;

        const range = ageRanges.find(r => age >= r.min && age <= r.max);
        if (range) {
          ageGroups[range.label].sum += bmi;
          ageGroups[range.label].count += 1;
        }
      });

      setAgeRangeBmiData(
        ageRanges.map(r => ({
          range: r.label,
          avgBmi: ageGroups[r.label].count > 0
            ? parseFloat((ageGroups[r.label].sum / ageGroups[r.label].count).toFixed(1))
            : 0,
          count: ageGroups[r.label].count,
        }))
      );

      setBmiStats({
        total,
        average: total > 0 ? parseFloat((sum / total).toFixed(1)) : 0,
        counts,
      });
    } catch (err) {
      console.error('[ReportPage] Error fetching BMI stats:', err);
    } finally {
      setBmiLoading(false);
    }
  }, []);

  // Re-fetch when filters change
  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  useEffect(() => {
    fetchBmiStats();
  }, [fetchBmiStats]);

  // Fetch community summary statistics
  const fetchCommunityStats = useCallback(async () => {
    setCommunityStatsLoading(true);
    try {
      const [commRes, patRes] = await Promise.all([
        api.getCommunities(),
        api.getPatients(),
      ]);
      const commData = commRes.data as any;
      const communities = commData?.data?.communities || commData?.communities || [];
      const patData = patRes.data as any;
      const patients = patData?.data?.patients || patData?.patients || [];

      const stats: CommunityStats[] = communities.map((c: any) => {
        const communityPatients = patients.filter((p: any) => {
          const commId = p.community?._id || p.community;
          return commId === c._id;
        });
        let positive = 0;
        let negative = 0;
        let totalTests = 0;
        communityPatients.forEach((p: any) => {
          const tests = p.testDetails || [];
          totalTests += tests.length;
          tests.forEach((t: any) => {
            const r = (t.testResult || '').toLowerCase().trim();
            if (r === 'positive') positive++;
            else if (r === 'negative') negative++;
          });
        });

        const agents = c.fieldOfficers || [];
        return {
          id: c._id,
          name: c.name,
          lga: c.lga || '-',
          totalPatients: communityPatients.length,
          totalTests,
          positiveTests: positive,
          negativeTests: negative,
          assignedAgents: agents.length,
          agentNames: agents.map((a: any) => `${a.firstName || ''} ${a.lastName || ''}`.trim()).filter(Boolean),
        };
      });

      setCommunityStats(stats);
    } catch (err) {
      console.error('[ReportPage] Error fetching community stats:', err);
    } finally {
      setCommunityStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunityStats();
  }, [fetchCommunityStats]);

  // Bulk download community report as PDF
  const handleBulkDownload = async (communityId?: string) => {
    setBulkDownloadLoading(true);
    try {
      const patRes = await api.getPatients(communityId ? { community: communityId } : undefined);
      const patData = patRes.data as any;
      const patients = patData?.data?.patients || patData?.patients || [];
      
      const communityName = communityId 
        ? communityStats.find(c => c.id === communityId)?.name || 'Community'
        : 'All Communities';

      const stats = communityId ? communityStats.find(c => c.id === communityId) : undefined;

      const doc = generateCommunityReportPDF(communityName, patients, stats ? {
        totalPatients: stats.totalPatients,
        totalTests: stats.totalTests,
        positiveTests: stats.positiveTests,
        negativeTests: stats.negativeTests,
        assignedAgents: stats.assignedAgents,
        agentNames: stats.agentNames,
      } : undefined);

      doc.save(`health-report-${communityName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Bulk download error:', err);
    } finally {
      setBulkDownloadLoading(false);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      // Fetch all patients for full export
      const patRes = await api.getPatients(selectedCommunity ? { community: selectedCommunity } : undefined);
      const patData = patRes.data as any;
      const patients = patData?.data?.patients || patData?.patients || [];
      const commName = selectedCommunity
        ? communityStats.find(c => c.id === selectedCommunity)?.name || 'Filtered'
        : 'All Communities';

      const doc = generateCommunityReportPDF(commName, patients);
      doc.save(`analytics-report-${commName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExportLoading(false);
    }
  };

  const handleViewTests = (officerId: string, officerName: string) => {
    setSelectedOfficer({ id: officerId, name: officerName });
    setShowOfficerTestsModal(true);
  };

  const handlePatientSelect = (patient: PatientTestRecord) => {
    setSelectedPatient(patient);
    setShowTestDetailsModal(true);
  };

  const maxBmiCount = Math.max(1, ...Object.values(bmiStats.counts));

  return (
    <main className="bg-white border border-[#d9d9d9] border-r-0 rounded-bl-[20px] rounded-tl-[20px] w-full min-h-[calc(100vh-93px)]">
      {/* Header */}
      <div
        className="border-2 border-[#fff9e6] h-12 sm:h-[50px] mx-4 lg:mx-6 my-3 overflow-hidden rounded-lg flex items-center px-4 sm:px-5"
        style={{
          backgroundImage: 'linear-gradient(172.45deg, rgba(255, 249, 230, 1) 3.64%, rgba(232, 241, 255, 1) 100.8%)',
        }}
      >
        <p className="text-base sm:text-lg lg:text-xl font-semibold uppercase text-[#212b36] font-poppins">
          Analytics & Reports
        </p>
      </div>

      {/* Content Container */}
      <div className="flex flex-col gap-5 sm:gap-6 lg:gap-8 px-4 lg:px-6 pt-4 sm:pt-6 pb-8 sm:pb-10">
        {/* Filters - needs to be above charts */}
        <div className="relative z-20">
          <AnalyticsFilters
            onCommunityChange={setSelectedCommunity}
            onTestTypeChange={setSelectedTestType}
            onDateChange={setSelectedDate}
            onExport={handleExport}
          />
        </div>

        {/* Charts and Reports */}
        <div className="flex flex-col gap-5 sm:gap-6 w-full relative z-10">
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 w-full">
            <CasesPerCommunity data={casesData} loading={chartsLoading} />
            <RatePerType data={rateData} loading={chartsLoading} />
          </div>

          {/* BMI Overview */}
          <div className="border border-[#d9d9d9] rounded-lg overflow-hidden bg-white">
            <div className="bg-[#e8f1ff] border-b-2 border-[#2c7be5] py-2 px-4">
              <h3 className="text-base font-semibold text-[#212b36] font-poppins">BMI Overview</h3>
            </div>
            <div className="p-4">
              {bmiLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2c7be5]" />
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <p className="text-xs text-[#637381] font-poppins">Average BMI</p>
                      <p className="text-lg font-semibold text-[#212b36] font-poppins">{bmiStats.average}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#637381] font-poppins">Total With BMI</p>
                      <p className="text-lg font-semibold text-[#212b36] font-poppins">{bmiStats.total}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {Object.entries(bmiStats.counts).map(([label, count]) => (
                      <div key={label} className="flex items-center gap-3">
                        <div className="w-24 text-xs text-[#637381] font-poppins">{label}</div>
                        <div className="flex-1 h-2 bg-[#f4f5f7] rounded">
                          <div
                            className="h-2 rounded bg-[#2c7be5]"
                            style={{ width: `${(count / maxBmiCount) * 100}%` }}
                          />
                        </div>
                        <div className="w-8 text-xs text-right text-[#637381] font-poppins">{count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Age Range vs BMI Chart */}
          <div className="border border-[#d9d9d9] rounded-lg overflow-hidden bg-white">
            <div className="bg-[#e8f1ff] border-b-2 border-[#2c7be5] py-2 px-4">
              <h3 className="text-base font-semibold text-[#212b36] font-poppins">Age Range vs BMI</h3>
            </div>
            <div className="p-4">
              {bmiLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2c7be5]" />
                </div>
              ) : (() => {
                const maxAvg = Math.max(1, ...ageRangeBmiData.map(d => d.avgBmi));
                const hasData = ageRangeBmiData.some(d => d.count > 0);
                return hasData ? (
                  <div className="flex flex-col gap-4">
                    <p className="text-xs text-[#637381] font-poppins">Average BMI per age group</p>
                    <div className="flex items-end gap-3 sm:gap-6 h-48 pt-4">
                      {ageRangeBmiData.map((item) => {
                        const barHeight = item.avgBmi > 0 ? Math.max(8, (item.avgBmi / maxAvg) * 100) : 0;
                        const barColor = item.avgBmi === 0 ? '#e5e7eb'
                          : item.avgBmi < 18.5 ? '#60a5fa'
                          : item.avgBmi < 25 ? '#34d399'
                          : item.avgBmi < 30 ? '#fbbf24'
                          : '#f87171';
                        return (
                          <div key={item.range} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                            {item.avgBmi > 0 && (
                              <span className="text-xs font-semibold text-[#212b36] font-poppins">{item.avgBmi}</span>
                            )}
                            <div
                              className="w-full max-w-[48px] rounded-t-md transition-all duration-500"
                              style={{ height: `${barHeight}%`, backgroundColor: barColor, minHeight: item.avgBmi > 0 ? '8px' : '2px' }}
                            />
                            <div className="text-center mt-1">
                              <p className="text-xs font-medium text-[#212b36] font-poppins">{item.range}</p>
                              <p className="text-[10px] text-[#637381] font-poppins">{item.count} pts</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-[#637381] font-poppins">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#60a5fa]" />Underweight (&lt;18.5)</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#34d399]" />Normal (18.5-24.9)</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#fbbf24]" />Overweight (25-29.9)</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#f87171]" />Obese (30+)</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[#637381] font-poppins py-4 text-center">No BMI data available for age range analysis</p>
                );
              })()}
            </div>
          </div>

          {/* Community Summary Statistics */}
          <div className="border border-[#d9d9d9] rounded-lg overflow-hidden bg-white">
            <div className="bg-[#e8f1ff] border-b-2 border-[#2c7be5] py-2 px-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#212b36] font-poppins">Community Summary</h3>
              <button
                onClick={() => handleBulkDownload()}
                disabled={bulkDownloadLoading || communityStatsLoading}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#2c7be5] text-white font-poppins hover:bg-blue-600 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {bulkDownloadLoading ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                )}
                Download All
              </button>
            </div>
            <div className="p-4">
              {communityStatsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2c7be5]" />
                </div>
              ) : communityStats.length === 0 ? (
                <p className="text-sm text-[#637381] font-poppins py-4 text-center">No community data available</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#d9d9d9]">
                        <th className="text-xs font-semibold text-[#637381] font-poppins py-2 pr-3 uppercase">Community</th>
                        <th className="text-xs font-semibold text-[#637381] font-poppins py-2 px-3 uppercase">LGA</th>
                        <th className="text-xs font-semibold text-[#637381] font-poppins py-2 px-3 uppercase text-center">Patients</th>
                        <th className="text-xs font-semibold text-[#637381] font-poppins py-2 px-3 uppercase text-center">Tests</th>
                        <th className="text-xs font-semibold text-[#637381] font-poppins py-2 px-3 uppercase text-center">Positive</th>
                        <th className="text-xs font-semibold text-[#637381] font-poppins py-2 px-3 uppercase text-center">Negative</th>
                        <th className="text-xs font-semibold text-[#637381] font-poppins py-2 px-3 uppercase text-center">Agents</th>
                        <th className="text-xs font-semibold text-[#637381] font-poppins py-2 px-3 uppercase text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {communityStats.map((stat) => (
                        <tr key={stat.id} className="border-b border-[#f4f5f7] hover:bg-[#f9fafb] transition-colors">
                          <td className="text-sm font-medium text-[#212b36] font-poppins py-2.5 pr-3">{stat.name}</td>
                          <td className="text-sm text-[#637381] font-poppins py-2.5 px-3">{stat.lga}</td>
                          <td className="text-sm font-semibold text-[#212b36] font-poppins py-2.5 px-3 text-center">{stat.totalPatients}</td>
                          <td className="text-sm text-[#212b36] font-poppins py-2.5 px-3 text-center">{stat.totalTests}</td>
                          <td className="text-sm text-red-600 font-poppins py-2.5 px-3 text-center">{stat.positiveTests}</td>
                          <td className="text-sm text-green-600 font-poppins py-2.5 px-3 text-center">{stat.negativeTests}</td>
                          <td className="text-sm text-[#637381] font-poppins py-2.5 px-3 text-center" title={stat.agentNames.join(', ')}>{stat.assignedAgents}</td>
                          <td className="text-sm font-poppins py-2.5 px-3 text-right">
                            <button
                              onClick={() => handleBulkDownload(stat.id)}
                              disabled={bulkDownloadLoading}
                              className="text-xs px-2 py-1 rounded bg-[#e8f1ff] text-[#2c7be5] hover:bg-[#d0e3ff] transition-colors cursor-pointer disabled:opacity-50"
                            >
                              Download
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Field Officer Report */}
          <FieldOfficerReport onViewTests={handleViewTests} />
        </div>
      </div>

      {/* Officer Test List Modal */}
      {selectedOfficer && (
        <OfficerTestListModal
          isOpen={showOfficerTestsModal}
          onClose={() => {
            setShowOfficerTestsModal(false);
            setSelectedOfficer(null);
          }}
          officerId={selectedOfficer.id}
          officerName={selectedOfficer.name}
          onPatientSelect={handlePatientSelect}
        />
      )}

      {/* Officer Test Details Modal */}
      {selectedPatient && (
        <OfficerTestDetailsModal
          isOpen={showTestDetailsModal}
          onClose={() => {
            setShowTestDetailsModal(false);
            setSelectedPatient(null);
          }}
          patientName={selectedPatient.name}
          patientInfo={{
            lga: selectedPatient.lga,
            community: selectedPatient.community,
            firstName: selectedPatient.firstName,
            lastName: selectedPatient.lastName,
            age: selectedPatient.age,
            gender: selectedPatient.gender,
            phoneNumber: selectedPatient.phoneNumber,
          }}
          testDetails={selectedPatient.testDetails?.[0] ? {
            testType: selectedPatient.testDetails[0].testType,
            testResult: selectedPatient.testDetails[0].testResult,
            dateConducted: selectedPatient.testDetails[0].dateConducted,
            officerNote: selectedPatient.testDetails[0].officerNote,
            heightCm: selectedPatient.testDetails[0].heightCm,
            weightKg: selectedPatient.testDetails[0].weightKg,
            bmi: selectedPatient.testDetails[0].bmi,
            bmiCategory: selectedPatient.testDetails[0].bmiCategory,
            bloodPressureSystolic: selectedPatient.testDetails[0].bloodPressureSystolic,
            bloodPressureDiastolic: selectedPatient.testDetails[0].bloodPressureDiastolic,
            bpCategory: selectedPatient.testDetails[0].bpCategory,
            glucoseLevel: selectedPatient.testDetails[0].glucoseLevel,
            glucoseUnit: selectedPatient.testDetails[0].glucoseUnit,
          } : undefined}
          onDownload={() => {
            let adminEmail = '-';
            try { const d = JSON.parse(localStorage.getItem('adminData') || '{}'); adminEmail = d.email || '-'; } catch { /* ignore */ }
            const doc = generatePatientReportPDF({
              name: selectedPatient.name,
              patientId: selectedPatient.patientId || '',
              age: selectedPatient.age,
              gender: selectedPatient.gender,
              phone: selectedPatient.phoneNumber,
              community: selectedPatient.community,
              lga: selectedPatient.lga,
              totalTests: selectedPatient.testDetails?.length || 0,
              adminEmail,
              reportIndex: 1,
              testDetails: selectedPatient.testDetails?.map((t: any) => ({
                testType: t.testType,
                testResult: t.testResult,
                dateConducted: t.dateConducted,
                officerNote: t.officerNote,
                heightCm: t.heightCm,
                weightKg: t.weightKg,
                bmi: t.bmi,
                bmiCategory: t.bmiCategory,
                bloodPressureSystolic: t.bloodPressureSystolic,
                bloodPressureDiastolic: t.bloodPressureDiastolic,
                bpCategory: t.bpCategory,
                glucoseLevel: t.glucoseLevel,
                glucoseUnit: t.glucoseUnit,
              })) || [],
            });
            doc.save(`patient-report-${selectedPatient.name.replace(/\s+/g, '-')}.pdf`);
          }}
        />
      )}
    </main>
  );
}
