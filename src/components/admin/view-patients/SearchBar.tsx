import React from 'react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: () => void;
}

export default function SearchBar({ searchQuery, onSearchChange, onSearch }: SearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full sm:w-auto">
      <div className="relative w-full sm:w-[301px] h-12 rounded-[10px] bg-white border border-[#d9d9d9] flex items-center px-5">
        <svg className="w-6 h-6 text-[#d9d9d9] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search here"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          className="w-full bg-transparent text-[#212b36] placeholder:text-[#d9d9d9] text-sm font-poppins focus:outline-none"
        />
      </div>
      <button
        onClick={onSearch}
        className="w-full sm:w-auto h-12 px-6 rounded-[10px] bg-[#2c7be5] text-white font-medium font-inter hover:bg-blue-600 transition-colors"
      >
        Search
      </button>
    </div>
  );
}
