'use client';
import React from 'react';

interface CommunityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  community?: {
    name: string;
    population?: string;
    lga: string;
    fieldOfficer?: string;
    totalTests?: string;
    visitationDates?: string[];
    mapImageUrl?: string;
  };
}

export default function CommunityDetailsModal({
  isOpen,
  onClose,
  community = {
    name: 'Igbogbo',
    population: '23,000',
    lga: 'Ikorodu',
    fieldOfficer: 'Michael Tokunbo',
    totalTests: '2,000',
    visitationDates: ['20/02/2025', '09/12/2024'],
    mapImageUrl: '/images/map-placeholder.png',
  },
}: CommunityDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/20 backdrop-blur-[10px] cursor-pointer"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal - Responsive layout */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[625px] bg-white rounded-[10px] shadow-lg max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between border-b border-[#d9d9d9] px-4 sm:px-6 py-3 sm:py-4 z-10">
          <h2 className="text-lg sm:text-xl font-medium text-[#212b36] font-poppins">{community.name}</h2>
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
        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Map Section */}
          <div className="bg-gray-100 h-32 sm:h-40 rounded-lg overflow-hidden border border-[#d9d9d9] flex items-center justify-center">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto text-[#637381]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm text-[#637381] mt-2 font-poppins">{community.name} Location</p>
            </div>
          </div>

          {/* Details Sections */}
          <div className="space-y-6 sm:space-y-8">
            {/* Population */}
            {community.population && (
              <div className="border-b border-[#d9d9d9] pb-4">
                <h3 className="text-sm sm:text-base font-semibold text-[#212b36] font-poppins mb-2">Population</h3>
                <p className="text-sm sm:text-base text-[#637381] font-poppins">{community.population}</p>
              </div>
            )}

            {/* LGA */}
            <div className="border-b border-[#d9d9d9] pb-4">
              <h3 className="text-sm sm:text-base font-semibold text-[#212b36] font-poppins mb-2">LGA</h3>
              <p className="text-sm sm:text-base text-[#637381] font-poppins">{community.lga}</p>
            </div>

            {/* Field Officers */}
            <div className="border-b border-[#d9d9d9] pb-4">
              <h3 className="text-sm sm:text-base font-semibold text-[#212b36] font-poppins mb-2">Field Officer Assigned</h3>
              <p className="text-sm sm:text-base text-[#637381] font-poppins">{community.fieldOfficer || 'N/A'}</p>
            </div>

            {/* Total Tests Conducted */}
            {community.totalTests && (
              <div className="border-b border-[#d9d9d9] pb-4">
                <h3 className="text-sm sm:text-base font-semibold text-[#212b36] font-poppins mb-2">Total Tests Conducted</h3>
                <p className="text-sm sm:text-base text-[#637381] font-poppins">{community.totalTests}</p>
              </div>
            )}

            {/* Visitation Summary */}
            {community.visitationDates && community.visitationDates.length > 0 && (
              <div className="border-b border-[#d9d9d9] pb-4">
                <h3 className="text-sm sm:text-base font-semibold text-[#212b36] font-poppins mb-2">Visitation Summary</h3>
                <div className="space-y-1">
                  {community.visitationDates.map((date, index) => (
                    <p key={index} className="text-sm sm:text-base text-[#637381] font-poppins">
                      {date}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
