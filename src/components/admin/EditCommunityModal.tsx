'use client';
import React, { useState } from 'react';
import Image from 'next/image';

interface EditCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  community?: {
    name: string;
    lga: string;
    fieldOfficers?: string[];
  };
  onSave?: (data: { name: string; lga: string; fieldOfficers: string[] }) => void;
}

export default function EditCommunityModal({
  isOpen,
  onClose,
  onSave,
  community = {
    name: 'Igbogbo',
    lga: 'Ikorodu',
    fieldOfficers: ['Tope Barakat', 'Musa Mohammed'],
  },
}: EditCommunityModalProps) {
  const [selectedCommunity, setSelectedCommunity] = useState(community.name);
  const [selectedLga, setSelectedLga] = useState(community.lga);
  const [selectedOfficers, setSelectedOfficers] = useState<string[]>(community.fieldOfficers || []);

  if (!isOpen) return null;

  const handleRemoveOfficer = (officerToRemove: string) => {
    setSelectedOfficers(selectedOfficers.filter(officer => officer !== officerToRemove));
  };

  const handleUpdateCommunity = () => {
    onSave?.({
      name: selectedCommunity,
      lga: selectedLga,
      fieldOfficers: selectedOfficers,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/20 backdrop-blur-[10px] cursor-pointer"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal - Responsive layout */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[625px] bg-white rounded-[10px] shadow-lg overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#d9d9d9] px-4 sm:px-[22px] py-3 sm:py-4 bg-white h-12 sm:h-[48px]">
          <h2 className="text-lg sm:text-[20px] font-medium text-[#212b36] font-poppins">Edit Community</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-[#637381] hover:text-[#212b36] transition-colors shrink-0 cursor-pointer"
          >
            <Image src="/icons/cancel-01.svg" alt="Close" width={24} height={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-[55px] sm:pt-[78px] flex flex-col gap-[40px] max-h-[85vh] overflow-y-auto">
          {/* Form Fields */}
          <div className="flex flex-col gap-[26px] w-full sm:w-[516px]">
            {/* Community Field */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-xs sm:text-[14px] font-medium text-[#637381] font-poppins">Community</label>
              <div className="relative bg-white border border-[#d9d9d9] rounded-[4px] h-10 sm:h-[48px] flex items-center px-4 sm:px-[21px]">
                <input
                  type="text"
                  value={selectedCommunity}
                  onChange={(e) => setSelectedCommunity(e.target.value)}
                  className="w-full border-0 outline-none bg-transparent text-xs sm:text-[14px] text-[#212b36] font-poppins"
                />
                <div className="absolute right-2 sm:right-[9px] pointer-events-none">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* LGA Field */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-xs sm:text-[14px] font-medium text-[#637381] font-poppins">LGA</label>
              <div className="relative bg-white border border-[#d9d9d9] rounded-[4px] h-10 sm:h-[48px] flex items-center px-4 sm:px-[21px]">
                <input
                  type="text"
                  value={selectedLga}
                  onChange={(e) => setSelectedLga(e.target.value)}
                  className="w-full border-0 outline-none bg-transparent text-xs sm:text-[14px] text-[#212b36] font-poppins"
                />
                <div className="absolute right-2 sm:right-[9px] pointer-events-none">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Field Officers */}
            <div className="flex flex-col gap-[6px]">
              <label className="text-xs sm:text-[14px] font-medium text-[#637381] font-poppins">Add Field Officer</label>
              <div className="relative bg-white border border-[#d9d9d9] rounded-[4px] h-10 sm:h-[48px] flex items-center px-4 sm:px-[21px]">
                <p className="text-xs sm:text-[14px] text-[#212b36] font-poppins flex-1">
                  {selectedOfficers.length > 0 ? selectedOfficers.join(', ') : 'Select officers'}
                </p>
                <div className="absolute right-2 sm:right-[9px] pointer-events-none">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              {/* Selected Officers Tags */}
              {selectedOfficers.length > 0 && (
                <div className="flex flex-wrap gap-2 sm:gap-[21px] mt-2 sm:mt-3">
                  {selectedOfficers.map((officer, index) => (
                    <div key={index} className="flex items-center gap-1 sm:gap-[6px] bg-gray-50 px-2 sm:px-3 py-1 sm:py-2 rounded text-xs sm:text-[10px] text-[#637381] font-poppins">
                      <span>{officer}</span>
                      <button
                        onClick={() => handleRemoveOfficer(officer)}
                        className="text-[#637381] hover:text-[#212b36] transition-colors shrink-0 ml-1 cursor-pointer"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="#637381" strokeWidth="2"/>
                          <path d="M15 9L9 15M9 9L15 15" stroke="#637381" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
            className="bg-[#2c7be5] text-white rounded-[10px] h-10 sm:h-[48px] font-medium text-sm sm:text-[16px] hover:bg-blue-600 transition-colors font-poppins w-full sm:w-[516px] cursor-pointer"
          >
            Update Community
          </button>
        </div>
      </div>
    </div>
  );
}
