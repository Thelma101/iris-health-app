'use client';
import React from 'react';

// Field officer can be either a full object (from GET) or just an ID (for PUT/POST)
type FieldOfficerRef = string | { _id: string; firstName: string; lastName: string; email: string };

interface CommunityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  community?: {
    _id?: string;
    name: string;
    population?: string;
    lga: string;
    fieldOfficer?: string;
    fieldOfficers?: FieldOfficerRef[];
    totalTests?: string;
    totalPopulation?: number;
    totalTestsConducted?: number;
    visitationDates?: string[];
    dateVisited?: string;
    mapImageUrl?: string;
  };
}

export default function CommunityDetailsModal({
  isOpen,
  onClose,
  community,
}: CommunityDetailsModalProps) {
  if (!isOpen || !community) return null;

  // Format population number
  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null) return '-';
    return num.toLocaleString();
  };

  // Get field officers display
  const getFieldOfficers = (): string => {
    if (community.fieldOfficers && community.fieldOfficers.length > 0) {
      return community.fieldOfficers
        .filter(fo => fo && typeof fo === 'object' && fo.firstName && fo.lastName)
        .map(fo => typeof fo === 'object' ? `${fo.firstName} ${fo.lastName}` : fo)
        .join(', ') || '-';
    }
    return community.fieldOfficer || '-';
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px] cursor-pointer"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Right Side Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-[420px] bg-white shadow-xl overflow-y-auto animate-[slideInRight_0.3s_ease-out]">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between border-b border-[#d9d9d9] px-6 py-4 z-10">
          <h2 className="text-xl font-medium text-[#212b36] font-poppins">{community.name}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-[#637381] hover:text-[#212b36] transition-colors flex-shrink-0 cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-0">
          {/* Map Section */}
          <div className="bg-gray-100 h-48 rounded-lg overflow-hidden border border-[#e5e7eb] mb-6">
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(community.name + ' ' + community.lga + ' Nigeria')}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
              className="w-full h-full"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Details Sections */}
          <div className="space-y-0">
            {/* Population */}
            <div className="border-b border-[#e5e7eb] py-4">
              <h3 className="text-sm font-semibold text-[#212b36] font-poppins mb-1">Population</h3>
              <p className="text-sm text-[#637381] font-poppins">
                {formatNumber(community.totalPopulation) || community.population || '-'}
              </p>
            </div>

            {/* LGA */}
            <div className="border-b border-[#e5e7eb] py-4">
              <h3 className="text-sm font-semibold text-[#212b36] font-poppins mb-1">LGA</h3>
              <p className="text-sm text-[#637381] font-poppins">{community.lga}</p>
            </div>

            {/* Field Officers */}
            <div className="border-b border-[#e5e7eb] py-4">
              <h3 className="text-sm font-semibold text-[#212b36] font-poppins mb-1">Field Officers</h3>
              <p className="text-sm text-[#637381] font-poppins">{getFieldOfficers()}</p>
            </div>

            {/* Total Tests Conducted */}
            <div className="border-b border-[#e5e7eb] py-4">
              <h3 className="text-sm font-semibold text-[#212b36] font-poppins mb-1">Total Tests Conducted</h3>
              <p className="text-sm text-[#637381] font-poppins">
                {formatNumber(community.totalTestsConducted) || community.totalTests || '-'}
              </p>
            </div>

            {/* Visitation Summary */}
            <div className="border-b border-[#e5e7eb] py-4">
              <h3 className="text-sm font-semibold text-[#212b36] font-poppins mb-1">Visitation Summary</h3>
              <div className="space-y-1">
                {community.visitationDates && community.visitationDates.length > 0 ? (
                  community.visitationDates.map((date, index) => (
                    <p key={index} className="text-sm text-[#637381] font-poppins">
                      {date}
                    </p>
                  ))
                ) : community.dateVisited && community.dateVisited !== '-' ? (
                  <p className="text-sm text-[#637381] font-poppins">{community.dateVisited}</p>
                ) : (
                  <p className="text-sm text-[#637381] font-poppins">-</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
