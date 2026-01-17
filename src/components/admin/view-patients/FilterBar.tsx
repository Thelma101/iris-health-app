import React from 'react';

interface FilterBarProps {
  selectedDate: string;
  onDateChange?: (date: string) => void;
  onExport: () => void;
}

export default function FilterBar({ selectedDate, onDateChange, onExport }: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full sm:w-auto">
      <div className="flex items-center gap-3 h-12 px-3 rounded-[10px] bg-white border border-[#d9d9d9] w-full sm:w-auto">
        <span className="text-[#637381] text-sm font-medium font-inter">{selectedDate}</span>
        <svg className="w-6 h-6 text-[#d9d9d9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
