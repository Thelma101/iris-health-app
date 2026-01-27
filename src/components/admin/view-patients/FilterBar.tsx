import React, { useRef } from 'react';

interface FilterBarProps {
  selectedDate: string;
  onDateChange?: (date: string) => void;
  onExport: () => void;
}

// Format date string to MM/DD/YY format
const formatDateDisplay = (dateStr: string) => {
  if (!dateStr) return '';
  // Handle ISO date format (YYYY-MM-DD)
  if (dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-');
    return `${month}/${day}/${year.slice(-2)}`;
  }
  return dateStr;
};

// Format display date to ISO format for input
const formatDateForInput = (displayDate: string) => {
  if (!displayDate) return '';
  // Handle MM/DD/YY format
  if (displayDate.includes('/')) {
    const [month, day, year] = displayDate.split('/');
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return displayDate;
};

export default function FilterBar({ selectedDate, onDateChange, onExport }: FilterBarProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoDate = e.target.value;
    const formattedDate = formatDateDisplay(isoDate);
    onDateChange?.(formattedDate);
  };

  const handleCalendarClick = () => {
    // Try showPicker first (modern browsers), fallback to click
    if (dateInputRef.current) {
      try {
        dateInputRef.current.showPicker();
      } catch {
        dateInputRef.current.click();
      }
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full sm:w-auto">
      <div
        className="relative flex items-center gap-3 h-12 px-3 rounded-[10px] bg-white border border-[#d9d9d9] w-full sm:w-auto cursor-pointer hover:border-[#2c7be5] transition-colors"
        onClick={handleCalendarClick}
      >
        <span className="text-[#637381] text-sm font-medium font-inter">{selectedDate}</span>
        <input
          ref={dateInputRef}
          type="date"
          value={formatDateForInput(selectedDate)}
          onChange={handleDateChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
          aria-label="Select date"
        />
        <svg className="w-6 h-6 text-[#637381] pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h18M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <button
        onClick={onExport}
        className="w-full sm:w-auto h-12 px-6 rounded-[10px] bg-white border border-[#d9d9d9] text-[#637381] font-medium font-inter hover:bg-gray-50 transition-colors"
      >
        Export
      </button>
    </div>
  );
}
