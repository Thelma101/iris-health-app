'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AnalyticsFilters from '@/components/admin/analytics/AnalyticsFilters';
import CasesPerCommunity from '@/components/admin/analytics/CasesPerCommunity';
import RatePerType from '@/components/admin/analytics/RatePerType';
import FieldOfficerReport from '@/components/admin/analytics/FieldOfficerReport';
import OfficerTestListModal, { PatientTestRecord } from '@/components/admin/OfficerTestListModal';
import OfficerTestDetailsModal from '@/components/admin/OfficerTestDetailsModal';
import api from '@/lib/api/index';

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
  
  // Chart data states
  const [casesData, setCasesData] = useState<Array<{ label: string; value: number }>>([]);
  const [rateData, setRateData] = useState<Array<{ label: string; value: number; color: string }>>([]);
  const [chartsLoading, setChartsLoading] = useState(true);

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

      // Fetch rate per type
      const rateRes = await api.getTestRatePerType(params);
      if (rateRes?.success && rateRes.data) {
        // Convert to array format for the component
        const rateDataArray = [
          { label: 'Positive', value: rateRes.data.positivePercentage, color: '#F97316' },
          { label: 'Negative', value: rateRes.data.negativePercentage, color: '#3B82F6' },
        ];
        setRateData(rateDataArray);
      }
    } catch (err) {
      console.error('[ReportPage] Error fetching chart data:', err);
    } finally {
      setChartsLoading(false);
    }
  }, [selectedCommunity, selectedTestType, selectedDate]);

  // Re-fetch when filters change
  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const handleExport = async () => {
    setExportLoading(true);
    try {
      // Generate report data
      const reportData = `Analytics Report - ${selectedDate}\n\nCommunity: ${selectedCommunity || 'All'}\nTest Type: ${selectedTestType || 'All'}\n\nGenerated at: ${new Date().toLocaleString()}`;
      const blob = new Blob([reportData], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${selectedDate.replace(/\//g, '-')}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
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
            testSheetImage: selectedPatient.testDetails[0].testSheetUrl,
            patientImage: selectedPatient.testDetails[0].patientImage,
          } : undefined}
          onDownload={() => {
            // Generate patient report from actual data
            const test = selectedPatient.testDetails?.[0];
            const reportData = `Patient Report\n\nName: ${selectedPatient.name}\nCommunity: ${selectedPatient.community}\nLGA: ${selectedPatient.lga}\nAge: ${selectedPatient.age}\nGender: ${selectedPatient.gender}\nPhone: ${selectedPatient.phoneNumber}\n\nTest Type: ${test?.testType || 'N/A'}\nTest Result: ${test?.testResult || 'N/A'}\nDate: ${test?.dateConducted || 'N/A'}\nNotes: ${test?.officerNote || 'N/A'}\n\nGenerated at: ${new Date().toLocaleString()}`;
            const blob = new Blob([reportData], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `patient-report-${selectedPatient.name.replace(/\s+/g, '-')}.txt`;
            a.click();
            window.URL.revokeObjectURL(url);
          }}
        />
      )}
    </main>
  );
}
