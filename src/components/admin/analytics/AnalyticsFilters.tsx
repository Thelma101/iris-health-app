'use client';

import React, { useState, useRef } from 'react';

interface AnalyticsFiltersProps {
  onCommunityChange?: (community: string) => void;
  onTestTypeChange?: (testType: string) => void;
  onDateChange?: (date: string) => void;
  onExport?: () => void;
}

// Auto-format date input (e.g., "05152024" → "05/15/2024")
const formatDateInput = (value: string) => {
  // Remove all non-numeric characters
  const digits = value.replace(/\D/g, '');
  
  // Apply formatting based on length
  if (digits.length <= 2) {
    return digits;
  } else if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  } else {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  }
};

// Convert display date to ISO format for date input
const formatDateForInput = (displayDate: string) => {
  if (!displayDate) return '';
  // Handle MM/DD/YY or MM/DD/YYYY format
  const parts = displayDate.split('/');
  if (parts.length === 3) {
    const [month, day, year] = parts;
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return displayDate;
};

// Format ISO date to display format
const formatDateDisplay = (isoDate: string) => {
  if (!isoDate || !isoDate.includes('-')) return isoDate;
  const [year, month, day] = isoDate.split('-');
  return `${month}/${day}/${year.slice(-2)}`;
};

export default function AnalyticsFilters({
  onCommunityChange,
  onTestTypeChange,
  onDateChange,
  onExport,
}: AnalyticsFiltersProps) {
  const [selectedDate, setSelectedDate] = useState('02/10/25');
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleDateTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateInput(e.target.value);
    setSelectedDate(formatted);
    onDateChange?.(formatted);
  };

  const handleCalendarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDateDisplay(e.target.value);
    setSelectedDate(formatted);
    onDateChange?.(formatted);
  };

  const handleCalendarClick = () => {
    dateInputRef.current?.showPicker();
  };

  return (
    <div className="w-full">
      {/* All filters in a single horizontal row with flex-nowrap */}
      <div className="flex flex-nowrap items-center gap-3 w-full overflow-x-auto pb-2">
        <button className="flex-shrink-0 border border-[#d9d9d9] rounded-[10px] px-[10px] py-[10px] flex items-center gap-[14px] bg-white hover:border-[#2c7be5] transition-colors">
          <span className="text-[14px] sm:text-[16px] font-medium text-[#637381] font-inter whitespace-nowrap">Community</span>
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#637381]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <button className="flex-shrink-0 border border-[#d9d9d9] rounded-[10px] px-[10px] py-[10px] flex items-center gap-[14px] bg-white hover:border-[#2c7be5] transition-colors">
          <span className="text-[14px] sm:text-[16px] font-medium text-[#637381] font-inter whitespace-nowrap">Test Type</span>
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#637381]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div className="flex-shrink-0 border border-[#d9d9d9] rounded-[10px] px-[10px] py-[10px] flex items-center gap-[14px] bg-white hover:border-[#2c7be5] transition-colors">
          <input
            type="text"
            value={selectedDate}
            onChange={handleDateTextChange}
            maxLength={10}
            className="text-[14px] sm:text-[16px] font-medium text-[#637381] font-inter bg-transparent border-none outline-none w-[85px]"
            placeholder="MM/DD/YY"
          />
          <input
            ref={dateInputRef}
            type="date"
            value={formatDateForInput(selectedDate)}
            onChange={handleCalendarChange}
            className="sr-only"
          />
          <button 
            type="button" 
            onClick={handleCalendarClick}
            className="cursor-pointer hover:opacity-70 transition-opacity"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#637381]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

        <button
          onClick={onExport}
          className="flex-shrink-0 ml-auto bg-white border border-[#d9d9d9] rounded-[10px] px-[24px] h-[44px] sm:h-[48px] flex items-center justify-center text-[14px] sm:text-[16px] font-medium text-[#637381] font-inter hover:bg-[#f4f5f7] transition-colors whitespace-nowrap"
        >
          Export
        </button>
      </div>
    </div>
  );
}
