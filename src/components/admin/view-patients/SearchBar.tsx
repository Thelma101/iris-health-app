import React from 'react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: () => void;
  hideSearchButton?: boolean;
}

export default function SearchBar({ searchQuery, onSearchChange, onSearch, hideSearchButton = false }: SearchBarProps) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
      {/* Search Input - matches Figma width */}
      <div className="relative flex-1 sm:flex-none sm:w-[301px] h-12 rounded-[10px] bg-white border border-[#d9d9d9] flex items-center px-5">
        <svg className="w-6 h-6 text-[#d9d9d9] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search here"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          className="ml-[22px] w-full bg-transparent text-[#212b36] placeholder:text-[#d9d9d9] text-sm font-poppins focus:outline-none"
        />
      </div>
      {/* Search Button - matches Figma */}
      {!hideSearchButton && (
        <button
          onClick={onSearch}
          className="h-12 px-6 rounded-[10px] bg-[#2c7be5] text-white font-medium font-inter hover:bg-[#1f6fcc] transition-colors flex-shrink-0"
        >
          Search
        </button>
      )}
    </div>
  );
}
