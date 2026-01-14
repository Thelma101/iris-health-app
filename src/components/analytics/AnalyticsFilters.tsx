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
    <div className="flex flex-col gap-[14px] w-full">
      {/* First Row: Community and Date */}
      <div className="flex flex-wrap items-center justify-between gap-3 w-full">
        <button className="border border-[#d9d9d9] rounded-[10px] px-[10px] py-[10px] flex items-center gap-[14px] bg-white hover:border-[#2c7be5] transition-colors">
          <span className="text-[14px] sm:text-[16px] font-medium text-[#637381] font-inter">Community</span>
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#637381]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div className="border border-[#d9d9d9] rounded-[10px] px-[10px] py-[10px] flex items-center gap-[14px] bg-white">
          <input
            type="text"
            value={selectedDate}
            onChange={handleDateChange}
            className="text-[14px] sm:text-[16px] font-medium text-[#637381] font-inter bg-transparent border-none outline-none w-[70px] sm:w-20"
            placeholder="MM/DD/YY"
          />
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#637381]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      {/* Second Row: Test Type and Export */}
      <div className="flex flex-wrap items-end justify-between gap-3 w-full">
        <button className="border border-[#d9d9d9] rounded-[10px] px-[10px] py-[10px] flex items-center gap-[14px] bg-white hover:border-[#2c7be5] transition-colors">
          <span className="text-[14px] sm:text-[16px] font-medium text-[#637381] font-inter">Test Type</span>
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#637381]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <button
          onClick={onExport}
          className="bg-white border border-[#d9d9d9] rounded-[10px] px-[24px] h-[44px] sm:h-[48px] flex items-center justify-center text-[14px] sm:text-[16px] font-medium text-[#637381] font-inter hover:bg-[#f4f5f7] transition-colors"
        >
          Export
        </button>
      </div>
    </div>
  );
}
