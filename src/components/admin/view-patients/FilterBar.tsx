import React, { useRef } from 'react';

interface FilterBarProps {
  selectedDate: string;
  onDateChange?: (date: string) => void;
  onExport: () => void;
  className?: string;
}

// Format date string to DD/MM/YYYY format
const formatDateDisplay = (dateStr: string) => {
  if (!dateStr) return '';
  // Handle ISO date format (YYYY-MM-DD)
  if (dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }
  return dateStr;
};

// Format display date to ISO format for input
const formatDateForInput = (displayDate: string) => {
  if (!displayDate) return '';
  // Handle DD/MM/YYYY format
  if (displayDate.includes('/')) {
    const [day, month, year] = displayDate.split('/');
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return displayDate;
};

export default function FilterBar({ selectedDate, onDateChange, onExport, className = '' }: FilterBarProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Get today's date formatted for display
  const getTodayFormatted = () => {
    const today = new Date();
    return `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
  };

  // Use today's date if no date is selected
  const displayDate = selectedDate || getTodayFormatted();

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
    <div className={`flex flex-row gap-3 items-center w-full sm:w-auto ${className}`}>
      <button
        onClick={onExport}
        className="h-12 px-6 rounded-[10px] bg-white border border-[#d9d9d9] text-[#637381] font-medium font-inter hover:bg-gray-50 transition-colors"
      >
        Export
      </button>
      <div
        className="relative flex items-center gap-2 h-12 px-4 rounded-[10px] bg-white border border-[#d9d9d9] cursor-pointer hover:border-[#2c7be5] transition-colors min-w-[140px]"
        onClick={handleCalendarClick}
      >
        <span className="text-sm font-medium font-inter text-[#637381]">
          {displayDate}
        </span>
        <input
          ref={dateInputRef}
          type="date"
          value={formatDateForInput(displayDate)}
          onChange={handleDateChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
          aria-label="Select date"
        />
        <svg className="w-5 h-5 text-[#637381] pointer-events-none flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
    </div>
  );
}
