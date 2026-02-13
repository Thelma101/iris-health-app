'use client';

import React from 'react';

interface CommunityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  community: {
    name: string;
    population: string;
    lga: string;
    fieldOfficers: string[];
    totalTests: number;
    visitationDates: string[];
    mapUrl?: string;
  } | null;
}

const CommunityDetailsModal: React.FC<CommunityDetailsModalProps> = ({
  isOpen,
  onClose,
  community,
}) => {
  if (!isOpen || !community) return null;

  return (
    <>
      {/* Backdrop */}
      <button
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] cursor-pointer"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Right Side Drawer */}
      <div className="fixed right-0 top-0 h-screen w-full sm:w-[466px] bg-white z-50 flex flex-col overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-white border-b border-[#d9d9d9] h-12 flex items-center justify-between px-[22px] flex-shrink-0">
          <p className="font-poppins font-medium text-xl text-[#212b36]">
            {community.name}
          </p>
          <button
            onClick={onClose}
            className="text-[#637381] hover:text-[#212b36] transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">

        {/* Map Section */}
        <div className="h-[152px] mx-[21px] mt-[23px] bg-gray-200 rounded overflow-hidden">
          {community.mapUrl ? (
            <img
              src={community.mapUrl}
              alt="Community location"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-[#637381] text-sm">Map not available</span>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="px-[21px] py-6 flex flex-col gap-7">
          {/* Population */}
          <div className="border-b border-[#d9d9d9] pb-2">
            <p className="font-poppins font-semibold text-base text-[#212b36]">
              Population
            </p>
            <p className="font-poppins text-sm text-[#212b36] mt-2">
              {community.population}
            </p>
          </div>

          {/* LGA */}
          <div className="border-b border-[#d9d9d9] pb-2">
            <p className="font-poppins font-semibold text-base text-[#212b36]">
              LGA
            </p>
            <p className="font-poppins text-sm text-[#212b36] mt-2">
              {community.lga}
            </p>
          </div>

          {/* Field Officers */}
          <div className="border-b border-[#d9d9d9] pb-2">
            <p className="font-poppins font-semibold text-base text-[#212b36]">
              Field Officers
            </p>
            <p className="font-poppins text-sm text-[#212b36] mt-2">
              {community.fieldOfficers.join(', ')}
            </p>
          </div>

          {/* Total Tests Conducted */}
          <div className="border-b border-[#d9d9d9] pb-2">
            <p className="font-poppins font-semibold text-base text-[#212b36]">
              Total Tests Conducted
            </p>
            <p className="font-poppins text-sm text-[#212b36] mt-2">
              {community.totalTests.toLocaleString()}
            </p>
          </div>

          {/* Visitation Summary */}
          <div className="border-b border-[#d9d9d9] pb-2">
            <p className="font-poppins font-semibold text-base text-[#212b36]">
              Visitation Summary
            </p>
            {community.visitationDates.map((date, index) => (
              <p key={index} className="font-poppins text-sm text-[#212b36] mt-2">
                {date}
              </p>
            ))}
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default CommunityDetailsModal;
