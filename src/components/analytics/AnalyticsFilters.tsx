'use client';

import React, { useState } from 'react';

interface AnalyticsFiltersProps {
  onCommunityChange?: (community: string) => void;
  onTestTypeChange?: (testType: string) => void;
  onDateChange?: (date: string) => void;
  onExport?: () => void;
}

export default function AnalyticsFilters({
  onCommunityChange,
  onTestTypeChange,
  onDateChange,
  onExport,
}: AnalyticsFiltersProps) {
  const [selectedDate, setSelectedDate] = useState('02/10/25');

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    onDateChange?.(date);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between w-full">
      {/* Left Filters */}
      <div className="flex gap-3 flex-wrap">
        {/* Community Dropdown */}
        <button className="border border-[#d9d9d9] rounded-lg px-4 py-2.5 flex items-center gap-2 bg-white hover:border-[#2c7be5] transition-colors">
          <span className="text-[14px] font-medium text-[#637381] font-poppins">Community</span>
          <svg className="w-4 h-4 text-[#637381]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Test Type Dropdown */}
        <button className="border border-[#d9d9d9] rounded-lg px-4 py-2.5 flex items-center gap-2 bg-white hover:border-[#2c7be5] transition-colors">
          <span className="text-[14px] font-medium text-[#637381] font-poppins">Test Type</span>
          <svg className="w-4 h-4 text-[#637381]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex gap-4 items-center flex-wrap">
        {/* Date Picker */}
        <div className="border border-[#d9d9d9] rounded-lg px-4 py-2.5 flex items-center gap-2 bg-white">
          <input
            type="text"
            value={selectedDate}
            onChange={handleDateChange}
            className="text-[14px] font-medium text-[#637381] font-poppins bg-transparent border-none outline-none w-16"
            placeholder="02/10/25"
          />
          <svg className="w-4 h-4 text-[#637381]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Export Button */}
        <button
          onClick={onExport}
          className="border border-[#d9d9d9] rounded-lg px-6 py-2.5 text-[14px] font-medium text-[#637381] font-poppins bg-white hover:bg-gray-50 transition-colors"
        >
          Export
        </button>
      </div>
    </div>
  );
}
