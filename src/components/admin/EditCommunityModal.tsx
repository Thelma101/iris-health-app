'use client';
import React, { useState, useEffect, useRef } from 'react';
import api from '@/lib/api/index';
import { LGA_OPTIONS, COMMUNITY_OPTIONS } from '@/lib/constants/location-options';

interface FieldOfficer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface EditCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  community?: {
    _id?: string;
    name: string;
    lga: string;
    fieldOfficers?: string[] | FieldOfficer[];
  };
  onSave?: (data: { name: string; lga: string; fieldOfficers: string[] }) => void;
}

export default function EditCommunityModal({
  isOpen,
  onClose,
  onSave,
  community,
}: EditCommunityModalProps) {
  const [selectedCommunity, setSelectedCommunity] = useState(community?.name || '');
  const [selectedLga, setSelectedLga] = useState(community?.lga || '');
  const [selectedOfficers, setSelectedOfficers] = useState<FieldOfficer[]>([]);
  const [availableOfficers, setAvailableOfficers] = useState<FieldOfficer[]>([]);
  const [loadingOfficers, setLoadingOfficers] = useState(false);

  // Dropdown states
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);
  const [showLgaDropdown, setShowLgaDropdown] = useState(false);
  const [showOfficerDropdown, setShowOfficerDropdown] = useState(false);
  const [officerSearch, setOfficerSearch] = useState('');

  // Refs for click outside handling
  const communityRef = useRef<HTMLDivElement>(null);
  const lgaRef = useRef<HTMLDivElement>(null);
  const officerRef = useRef<HTMLDivElement>(null);
  const officerDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (communityRef.current && !communityRef.current.contains(event.target as Node)) {
        setShowCommunityDropdown(false);
      }
      if (lgaRef.current && !lgaRef.current.contains(event.target as Node)) {
        setShowLgaDropdown(false);
      }
      if (officerRef.current && !officerRef.current.contains(event.target as Node) &&
          officerDropdownRef.current && !officerDropdownRef.current.contains(event.target as Node)) {
        setShowOfficerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch field officers and set initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchFieldOfficers();
      setSelectedCommunity(community?.name || '');
      setSelectedLga(community?.lga || '');
    }
  }, [isOpen, community]);

  const fetchFieldOfficers = async () => {
    setLoadingOfficers(true);
    try {
      const res = await api.getFieldAgents();
      if (res.success && res.data) {
        const agentsData = res.data as any;
        const agents = agentsData?.data?.fieldAgents || agentsData?.fieldAgents || [];
        setAvailableOfficers(agents);

        // Set initially selected officers
        if (community?.fieldOfficers && community.fieldOfficers.length > 0) {
          const initialOfficers: FieldOfficer[] = [];
          community.fieldOfficers.forEach((officer) => {
            if (typeof officer === 'string') {
              // It's an ID, find the officer
              const found = agents.find((a: FieldOfficer) => a._id === officer);
              if (found) initialOfficers.push(found);
            } else if (officer && typeof officer === 'object' && officer._id) {
              // It's already an officer object
              initialOfficers.push(officer);
            }
          });
          setSelectedOfficers(initialOfficers);
        }
      }
    } catch (err) {
      console.error('Failed to fetch field officers:', err);
    } finally {
      setLoadingOfficers(false);
    }
  };

  const handleAddOfficer = (officerId: string) => {
    const officer = availableOfficers.find(o => o._id === officerId);
    if (officer && !selectedOfficers.find(o => o._id === officerId)) {
      setSelectedOfficers([...selectedOfficers, officer]);
    }
  };

  const handleRemoveOfficer = (officerId: string) => {
    setSelectedOfficers(selectedOfficers.filter((o) => o._id !== officerId));
  };

  const handleUpdateCommunity = () => {
    onSave?.({
      name: selectedCommunity,
      lga: selectedLga,
      fieldOfficers: selectedOfficers.map(o => o._id),
    });
    onClose();
  };

  // Filter officers by search
  const filteredOfficers = availableOfficers.filter(officer =>
    `${officer.firstName} ${officer.lastName}`.toLowerCase().includes(officerSearch.toLowerCase())
  );

  // Get display text for selected officers
  const selectedOfficersText = selectedOfficers.length > 0
    ? selectedOfficers.map(o => `${o.firstName} ${o.lastName}`).join(', ')
    : 'Select field officers';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/20 backdrop-blur-[10px] cursor-pointer"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal Container - centers both modal and side dropdown */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col lg:flex-row items-center lg:items-start gap-4 w-[90vw] max-w-[560px] lg:max-w-none lg:w-auto">
        {/* Main Modal */}
        <div className="w-full lg:w-[560px] bg-white rounded-[10px] shadow-lg max-h-[80vh] lg:max-h-[90vh] overflow-hidden flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-[#d9d9d9] px-4 sm:px-6 py-3 sm:py-4 shrink-0">
            <h2 className="text-lg sm:text-xl font-medium text-[#212b36] font-poppins">Edit Community</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-[#637381] hover:text-[#212b36] transition-colors shrink-0 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 overflow-y-auto flex-1">
            <div className="space-y-6 sm:space-y-8">
              {/* Community Dropdown */}
              <div className="space-y-2" ref={communityRef}>
                <label className="block text-xs sm:text-sm font-medium text-[#637381] font-poppins">
                  Community
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCommunityDropdown(!showCommunityDropdown);
                      setShowLgaDropdown(false);
                      setShowOfficerDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 sm:py-3 border border-[#d9d9d9] rounded text-sm sm:text-base text-left font-poppins bg-white hover:border-[#2c7be5] focus:outline-none focus:border-[#2c7be5] transition-colors flex items-center justify-between"
                  >
                    <span className={selectedCommunity ? 'text-[#212b36]' : 'text-[#999]'}>
                      {selectedCommunity || 'Select community'}
                    </span>
                    <svg className="w-5 h-5 text-[#637381]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showCommunityDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#d9d9d9] rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto">
                      {COMMUNITY_OPTIONS.map((communityOption) => (
                        <button
                          key={communityOption}
                          type="button"
                          onClick={() => {
                            setSelectedCommunity(communityOption);
                            setShowCommunityDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-[#212b36] font-poppins hover:bg-[#f4f5f7] transition-colors"
                        >
                          {communityOption}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* LGA Dropdown */}
              <div className="space-y-2" ref={lgaRef}>
                <label className="block text-xs sm:text-sm font-medium text-[#637381] font-poppins">
                  LGA
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLgaDropdown(!showLgaDropdown);
                      setShowCommunityDropdown(false);
                      setShowOfficerDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 sm:py-3 border border-[#d9d9d9] rounded text-sm sm:text-base text-left font-poppins bg-white hover:border-[#2c7be5] focus:outline-none focus:border-[#2c7be5] transition-colors flex items-center justify-between"
                  >
                    <span className={selectedLga ? 'text-[#212b36]' : 'text-[#999]'}>
                      {selectedLga || 'Select LGA'}
                    </span>
                    <svg className="w-5 h-5 text-[#637381]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showLgaDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#d9d9d9] rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto">
                      {LGA_OPTIONS.map((lga) => (
                        <button
                          key={lga}
                          type="button"
                          onClick={() => {
                            setSelectedLga(lga);
                            setShowLgaDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-[#212b36] font-poppins hover:bg-[#f4f5f7] transition-colors"
                        >
                          {lga}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Field Officer Dropdown Trigger */}
              <div className="space-y-2" ref={officerRef}>
                <label className="block text-xs sm:text-sm font-medium text-[#637381] font-poppins">
                  Add Field Officer
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowOfficerDropdown(!showOfficerDropdown);
                    setShowCommunityDropdown(false);
                    setShowLgaDropdown(false);
                  }}
                  className="w-full px-4 py-2.5 sm:py-3 border border-[#d9d9d9] rounded text-sm sm:text-base text-left font-poppins bg-white hover:border-[#2c7be5] focus:outline-none focus:border-[#2c7be5] transition-colors flex items-center justify-between"
                >
                  <span className={selectedOfficers.length > 0 ? 'text-[#212b36] truncate pr-2' : 'text-[#999]'}>
                    {selectedOfficersText}
                  </span>
                  <svg className="w-5 h-5 text-[#637381] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Selected Officers Tags - shown below dropdown trigger */}
                {selectedOfficers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedOfficers.map((officer) => (
                      <div
                        key={officer._id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f4f5f7] rounded text-xs text-[#637381] font-poppins"
                      >
                        <span>{officer.firstName} {officer.lastName}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveOfficer(officer._id)}
                          className="flex items-center justify-center hover:text-[#212b36] transition-colors"
                          aria-label={`Remove ${officer.firstName} ${officer.lastName}`}
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
                            <path d="M15 9l-6 6M9 9l6 6" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Update Button */}
            <button
              onClick={handleUpdateCommunity}
              className="w-full h-10 sm:h-12 bg-[#2c7be5] text-white text-sm sm:text-base font-medium rounded-[10px] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-[#2c7be5]/50 transition-colors font-poppins cursor-pointer"
            >
              Update Community
            </button>
          </div>
        </div>

        {/* Side Dropdown for Field Officers - appears to the right of modal on desktop, below on mobile */}
        {showOfficerDropdown && (
          <div
            ref={officerDropdownRef}
            className="w-full lg:w-[220px] bg-white border border-[#d9d9d9] rounded-lg shadow-lg overflow-hidden flex flex-col max-h-[250px] lg:max-h-[400px]"
          >
            {/* Avatar icons at top */}
            <div className="flex items-center gap-1 p-3 border-b border-[#f4f5f7]">
              {selectedOfficers.slice(0, 3).map((officer, idx) => {
                const colors = ['bg-[#2c7be5]', 'bg-[#f4a100]', 'bg-[#00c897]'];
                return (
                  <div
                    key={officer._id}
                    className={`w-8 h-8 rounded-full ${colors[idx % colors.length]} flex items-center justify-center text-white text-xs font-medium`}
                  >
                    {officer.firstName.charAt(0).toUpperCase()}
                  </div>
                );
              })}
              {selectedOfficers.length > 3 && (
                <span className="text-xs text-[#637381] ml-1">+{selectedOfficers.length - 3}</span>
              )}
            </div>

            {/* Search input */}
            <div className="p-3 border-b border-[#f4f5f7]">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#637381]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={officerSearch}
                  onChange={(e) => setOfficerSearch(e.target.value)}
                  placeholder="Search here"
                  className="w-full pl-9 pr-3 py-2 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins placeholder-[#999] focus:outline-none focus:border-[#2c7be5]"
                />
              </div>
            </div>

            {/* Officer list */}
            <div className="overflow-y-auto flex-1">
              {loadingOfficers ? (
                <div className="p-4 text-center text-sm text-[#637381] font-poppins">
                  Loading officers...
                </div>
              ) : filteredOfficers.length === 0 ? (
                <div className="p-4 text-center text-sm text-[#637381] font-poppins">
                  No field officers found
                </div>
              ) : (
                filteredOfficers.map((officer) => {
                  const isSelected = selectedOfficers.some(o => o._id === officer._id);
                  return (
                    <label
                      key={officer._id}
                      className="flex items-center justify-between px-4 py-3 hover:bg-[#f4f5f7] cursor-pointer transition-colors"
                    >
                      <span className={`text-sm font-poppins ${isSelected ? 'text-[#2c7be5]' : 'text-[#212b36]'}`}>
                        {officer.firstName} {officer.lastName}
                      </span>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          if (isSelected) {
                            handleRemoveOfficer(officer._id);
                          } else {
                            handleAddOfficer(officer._id);
                          }
                        }}
                        className="w-5 h-5 text-[#2c7be5] border-[#d9d9d9] rounded focus:ring-[#2c7be5] cursor-pointer accent-[#2c7be5]"
                      />
                    </label>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
