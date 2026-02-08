'use client';

import React, { useState, useRef, useEffect } from 'react';
import api from '@/lib/api/index';

interface AnalyticsFiltersProps {
  onCommunityChange?: (community: string) => void;
  onTestTypeChange?: (testType: string) => void;
  onDateChange?: (date: string) => void;
  onExport?: () => void;
}

interface CommunityOption {
  value: string;
  label: string;
}

const formatDateInput = (value: string) => {
  // Remove all non-numeric characters
  const digits = value.replace(/\D/g, '');

  // Apply formatting based on length - DD/MM/YYYY format
  if (digits.length <= 2) {
    return digits;
  } else if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  } else {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  }
};

const formatDateForInput = (displayDate: string) => {
  if (!displayDate) return '';
  // Handle DD/MM/YYYY or DD/MM/YY format
  const parts = displayDate.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    const fullYear = year.length === 2 ? `20${year}` : year;
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return displayDate;
};

const formatDateDisplay = (isoDate: string) => {
  if (!isoDate || !isoDate.includes('-')) return isoDate;
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

interface TestTypeOption {
  value: string;
  label: string;
}

export default function AnalyticsFilters({
  onCommunityChange,
  onTestTypeChange,
  onDateChange,
  onExport,
}: AnalyticsFiltersProps) {
  // Get today's date formatted
  const getTodayFormatted = () => {
    const today = new Date();
    return `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
  };
  
  const [selectedDate, setSelectedDate] = useState(''); // Empty = All dates
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [selectedTestType, setSelectedTestType] = useState('');
  const [communities, setCommunities] = useState<CommunityOption[]>([]);
  const [testTypes, setTestTypes] = useState<TestTypeOption[]>([]);
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);
  const [showTestTypeDropdown, setShowTestTypeDropdown] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const communityDesktopRef = useRef<HTMLDivElement>(null);
  const testTypeDesktopRef = useRef<HTMLDivElement>(null);
  const communityMobileRef = useRef<HTMLDivElement>(null);
  const testTypeMobileRef = useRef<HTMLDivElement>(null);

  // Display date: show today's date as placeholder when empty
  const displayDate = selectedDate || getTodayFormatted();

  useEffect(() => {
    // Fetch communities
    api.getCommunities()
      .then((res) => {
        const commData = res.data as any;
        const communitiesArray = commData?.data?.communities || commData?.communities || [];
        const mapped = communitiesArray.map((c: any) => ({
          value: c._id,
          label: c.name,
        }));
        setCommunities(mapped);
      })
      .catch((err) => {
        console.error('Error fetching communities:', err);
      });

    // Fetch test types from API
    api.getTestTypes()
      .then((res) => {
        const testData = res.data as any;
        const testTypesArray = testData?.data?.testTypes || testData?.testTypes || [];
        const mapped = testTypesArray.map((t: any) => ({
          value: t.name,
          label: t.name,
        }));
        setTestTypes(mapped);
      })
      .catch((err) => {
        console.error('Error fetching test types:', err);
        // No fallback - show empty list
        setTestTypes([]);
      });
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutsideCommunity = 
        (!communityDesktopRef.current || !communityDesktopRef.current.contains(target)) &&
        (!communityMobileRef.current || !communityMobileRef.current.contains(target));
      const isOutsideTestType = 
        (!testTypeDesktopRef.current || !testTypeDesktopRef.current.contains(target)) &&
        (!testTypeMobileRef.current || !testTypeMobileRef.current.contains(target));
      
      if (isOutsideCommunity) {
        setShowCommunityDropdown(false);
      }
      if (isOutsideTestType) {
        setShowTestTypeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleCommunitySelect = (community: CommunityOption) => {
    setSelectedCommunity(community.label);
    setShowCommunityDropdown(false);
    onCommunityChange?.(community.value);
  };

  const handleTestTypeSelect = (testType: string) => {
    setSelectedTestType(testType);
    setShowTestTypeDropdown(false);
    onTestTypeChange?.(testType);
  };

  return (
    <div className="w-full relative z-20">
      {/* Desktop Layout: Community, TestType | Date, Export */}
      <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="flex items-center gap-3 lg:gap-4">
        <div ref={communityDesktopRef} className="relative">
          <button
            onClick={() => setShowCommunityDropdown(!showCommunityDropdown)}
            className="h-[44px] lg:h-[48px] border border-[#d9d9d9] rounded-[10px] px-[10px] py-[10px] flex items-center justify-between bg-white hover:border-[#2c7be5] transition-colors min-w-[140px]"
          >
            <span className="text-[14px] lg:text-[16px] font-medium text-[#637381] font-inter truncate pr-1">
              {selectedCommunity || 'Community'}
            </span>
            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-[#637381] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showCommunityDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-[#d9d9d9] rounded-lg shadow-xl z-[100] min-w-full sm:min-w-[200px] max-h-[220px] overflow-y-auto">
              <button
                onClick={() => handleCommunitySelect({ value: '', label: '' })}
                className="w-full px-4 py-2 text-left text-[14px] text-[#637381] hover:bg-[#f4f5f7] font-poppins"
              >
                All Communities
              </button>
              {communities.map((community) => (
                <button
                  key={community.value}
                  onClick={() => handleCommunitySelect(community)}
                  className="w-full px-4 py-2 text-left text-[14px] text-[#637381] hover:bg-[#f4f5f7] font-poppins"
                >
                  {community.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div ref={testTypeDesktopRef} className="relative">
          <button
            onClick={() => setShowTestTypeDropdown(!showTestTypeDropdown)}
            className="h-[44px] lg:h-[48px] border border-[#d9d9d9] rounded-[10px] px-[10px] py-[10px] flex items-center justify-between bg-white hover:border-[#2c7be5] transition-colors min-w-[120px]"
          >
            <span className="text-[14px] lg:text-[16px] font-medium text-[#637381] font-inter truncate pr-1">
              {selectedTestType || 'Test Type'}
            </span>
            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-[#637381] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showTestTypeDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-[#d9d9d9] rounded-lg shadow-xl z-[100] min-w-full sm:min-w-[180px]">
              <button
                onClick={() => handleTestTypeSelect('')}
                className="w-full px-4 py-2 text-left text-[14px] text-[#637381] hover:bg-[#f4f5f7] font-poppins"
              >
                All Test Types
              </button>
              {testTypes.map((testType) => (
                <button
                  key={testType.value}
                  onClick={() => handleTestTypeSelect(testType.value)}
                  className="w-full px-4 py-2 text-left text-[14px] text-[#637381] hover:bg-[#f4f5f7] font-poppins"
                >
                  {testType.label}
                </button>
              ))}
            </div>
          )}
        </div>

        </div>
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="h-[44px] lg:h-[48px] border border-[#d9d9d9] rounded-[10px] px-[10px] py-[10px] flex items-center gap-[14px] bg-white hover:border-[#2c7be5] transition-colors">
            <input
              type="text"
              value={selectedDate}
              onChange={handleDateTextChange}
              maxLength={10}
              className="text-[14px] lg:text-[16px] font-medium text-[#637381] font-inter bg-transparent border-none outline-none w-[95px]"
              placeholder={getTodayFormatted()}
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
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-[#637381]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          <button
            onClick={onExport}
            className="h-[44px] lg:h-[48px] bg-white border border-[#d9d9d9] rounded-[10px] px-[20px] flex items-center justify-center text-[14px] lg:text-[16px] font-medium text-[#637381] font-inter hover:bg-[#f4f5f7] transition-colors whitespace-nowrap"
          >
            Export
          </button>
        </div>
      </div>

      {/* Mobile Layout: Row 1 = Community + Date, Row 2 = Test Type + Export */}
      <div className="flex sm:hidden flex-col gap-2">
        <div className="flex items-center gap-2">
          <div ref={communityMobileRef} className="relative flex-1">
            <button
              onClick={() => setShowCommunityDropdown(!showCommunityDropdown)}
              className="w-full h-11 border border-[#d9d9d9] rounded-[10px] px-3 py-2 flex items-center justify-between bg-white hover:border-[#2c7be5] transition-colors"
            >
              <span className="text-[13px] font-medium text-[#637381] font-inter truncate pr-1">
                {selectedCommunity || 'Community'}
              </span>
              <svg className="w-4 h-4 text-[#637381] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showCommunityDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-[#d9d9d9] rounded-lg shadow-xl z-[100] w-full max-h-[220px] overflow-y-auto">
                <button
                  onClick={() => handleCommunitySelect({ value: '', label: '' })}
                  className="w-full px-4 py-2 text-left text-[13px] text-[#637381] hover:bg-[#f4f5f7] font-poppins"
                >
                  All Communities
                </button>
                {communities.map((community) => (
                  <button
                    key={community.value}
                    onClick={() => handleCommunitySelect(community)}
                    className="w-full px-4 py-2 text-left text-[13px] text-[#637381] hover:bg-[#f4f5f7] font-poppins"
                  >
                    {community.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="h-11 border border-[#d9d9d9] rounded-[10px] px-3 py-2 flex items-center gap-2 bg-white hover:border-[#2c7be5] transition-colors">
            <input
              type="text"
              value={selectedDate}
              onChange={handleDateTextChange}
              maxLength={10}
              className="text-[13px] font-medium text-[#637381] font-inter bg-transparent border-none outline-none w-[80px]"
              placeholder={getTodayFormatted()}
            />
            <button
              type="button"
              onClick={handleCalendarClick}
              className="cursor-pointer hover:opacity-70 transition-opacity"
            >
              <svg className="w-4 h-4 text-[#637381]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div ref={testTypeMobileRef} className="relative flex-1">
            <button
              onClick={() => setShowTestTypeDropdown(!showTestTypeDropdown)}
              className="w-full h-11 border border-[#d9d9d9] rounded-[10px] px-3 py-2 flex items-center justify-between bg-white hover:border-[#2c7be5] transition-colors"
            >
              <span className="text-[13px] font-medium text-[#637381] font-inter truncate pr-1">
                {selectedTestType || 'Test Type'}
              </span>
              <svg className="w-4 h-4 text-[#637381] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showTestTypeDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-[#d9d9d9] rounded-lg shadow-xl z-[100] w-full">
                <button
                  onClick={() => handleTestTypeSelect('')}
                  className="w-full px-4 py-2 text-left text-[13px] text-[#637381] hover:bg-[#f4f5f7] font-poppins"
                >
                  All Test Types
                </button>
                {testTypes.map((testType) => (
                  <button
                    key={testType.value}
                    onClick={() => handleTestTypeSelect(testType.value)}
                    className="w-full px-4 py-2 text-left text-[13px] text-[#637381] hover:bg-[#f4f5f7] font-poppins"
                  >
                    {testType.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onExport}
            className="h-11 bg-white border border-[#d9d9d9] rounded-[10px] px-4 flex items-center justify-center text-[13px] font-medium text-[#637381] font-inter hover:bg-[#f4f5f7] transition-colors whitespace-nowrap"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
