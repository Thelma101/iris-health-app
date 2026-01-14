'use client';

import React, { useState } from 'react';
import AnalyticsFilters from '@/components/analytics/AnalyticsFilters';
import CasesPerCommunity from '@/components/analytics/CasesPerCommunity';
import RatePerType from '@/components/analytics/RatePerType';
import FieldOfficerReport from '@/components/analytics/FieldOfficerReport';
import OfficerTestListModal from '@/components/ui/OfficerTestListModal';
import OfficerTestDetailsModal from '@/components/ui/OfficerTestDetailsModal';

export default function ReportPage() {
  const [selectedDate, setSelectedDate] = useState('02/10/25');
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [selectedTestType, setSelectedTestType] = useState('');
  const [showOfficerTestsModal, setShowOfficerTestsModal] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<{ id: string; name: string } | null>(null);
  const [showTestDetailsModal, setShowTestDetailsModal] = useState(false);
  const [selectedPatientName, setSelectedPatientName] = useState<string>('');

  const handleExport = () => {
    // Connect to analytics export service
  };

  const handleViewTests = (officerId: string, officerName: string) => {
    setSelectedOfficer({ id: officerId, name: officerName });
    setShowOfficerTestsModal(true);
  };

  const handlePatientSelect = (patientName: string) => {
    setSelectedPatientName(patientName);
    setShowTestDetailsModal(true);
  };

  return (
    <main className="bg-white border border-[#d9d9d9] rounded-bl-[20px] rounded-tl-[20px] overflow-hidden w-full min-h-full">
      {/* Header */}
      <div
        className="border-2 border-[#fff9e6] h-[50px] mx-4 lg:mx-[26px] my-[13px] overflow-hidden rounded-[8px] flex items-center px-[17px]"
        style={{
          backgroundImage: 'linear-gradient(172.45deg, rgba(255, 249, 230, 1) 3.64%, rgba(232, 241, 255, 1) 100.8%)',
        }}
      >
        <p className="text-[16px] sm:text-[18px] lg:text-[20px] font-semibold uppercase text-[#212b36] font-poppins">
          Analytics & Reports
        </p>
      </div>

      {/* Content Container */}
      <div className="flex flex-col gap-[20px] sm:gap-[30px] lg:gap-[45px] px-4 lg:px-[26px] pt-[23px] pb-[40px]">
        {/* Filters */}
        <AnalyticsFilters
          onCommunityChange={setSelectedCommunity}
          onTestTypeChange={setSelectedTestType}
          onDateChange={setSelectedDate}
          onExport={handleExport}
        />

        {/* Charts and Reports */}
        <div className="flex flex-col gap-[20px] sm:gap-[26px] lg:gap-[30px] w-full">
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px] sm:gap-[26px] w-full">
            <CasesPerCommunity />
            <RatePerType />
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
          officerName={selectedOfficer.name}
          testType="HIV 1/2 Rapid Test"
          onPatientSelect={handlePatientSelect}
        />
      )}

      {/* Officer Test Details Modal */}
      {selectedPatientName && (
        <OfficerTestDetailsModal
          isOpen={showTestDetailsModal}
          onClose={() => {
            setShowTestDetailsModal(false);
            setSelectedPatientName('');
          }}
          patientName={selectedPatientName}
          testDetails={{
            testType: 'HIV 1/2 Rapid Test',
            testResult: 'Negative',
            dateConducted: '21/03/2025',
            officerNote: 'However rare side effects observed among children can be metabolic acidosis, coma, respiratory depre',
          }}
        />
      )}
    </main>
  );
}
