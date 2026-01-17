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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-[10px] border border-[#d9d9d9] w-[466px] max-h-[730px] overflow-hidden shadow-lg">
        {/* Header */}
        <div className="h-12 bg-white border-b border-[#d9d9d9] flex items-center px-[22px]">
          <p className="font-poppins font-medium text-xl text-[#212b36]">
            {community.name}
          </p>
        </div>

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
  );
};

export default CommunityDetailsModal;
