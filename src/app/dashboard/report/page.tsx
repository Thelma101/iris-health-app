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
    <main className="space-y-0 w-full">
      {/* Header with Filters Container */}
      <div className="rounded-bl-[20px] rounded-tl-[20px] bg-white border border-[#d9d9d9] border-b-0 overflow-clip w-full mb-6">
        {/* Header */}
        <div
          className="h-[50px] flex items-center px-[26px] w-full"
          style={{
            backgroundImage: 'linear-gradient(172.45deg, rgba(255, 249, 230, 1) 3.64%, rgba(232, 241, 255, 1) 100.8%)',
          }}
        >
          <h1 className="text-[20px] font-semibold uppercase text-[#212b36] font-poppins">Analytics & Reports</h1>
        </div>

        {/* Filters on Blurred Background */}
        <div
          className="px-[26px] py-[45px] backdrop-blur-sm"
          style={{
            backgroundImage: 'linear-gradient(118.89deg, rgba(255, 249, 230, 0.29) 3.64%, rgba(232, 241, 255, 0.29) 100.8%)',
          }}
        >
          <AnalyticsFilters
            onCommunityChange={setSelectedCommunity}
            onTestTypeChange={setSelectedTestType}
            onDateChange={setSelectedDate}
            onExport={handleExport}
          />
        </div>
      </div>

      {/* Content Area with padding */}
      <div className="px-6 space-y-6">
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[26px]">
          <CasesPerCommunity />
          <RatePerType />
        </div>

        {/* Field Officer Report */}
        <FieldOfficerReport onViewTests={handleViewTests} />
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
