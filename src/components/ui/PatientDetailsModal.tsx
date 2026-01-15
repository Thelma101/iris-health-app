'use client';

import React from 'react';

const imgCancel = 'https://www.figma.com/api/mcp/asset/6aca19c6-4713-4165-b581-e15290423d87';

interface PatientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: {
    name: string;
    lga: string;
    community: string;
    firstName: string;
    lastName: string;
    age: string;
    gender: string;
    phoneNumber: string;
  };
  testDetails?: {
    testType: string;
    testResult: string;
    dateConducted: string;
    officerNote: string;
    testSheetImage?: string;
  };
  patientImage?: string;
  onDownload?: () => void;
}

export default function PatientDetailsModal({
  isOpen,
  onClose,
  patient,
  testDetails,
  patientImage,
  onDownload,
}: PatientDetailsModalProps) {
  if (!isOpen || !patient) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-white/30 backdrop-blur-sm cursor-pointer" onClick={onClose} />

      {/* Modal Drawer */}
      <div className="fixed right-0 top-0 h-screen w-full max-w-[466px] sm:w-[466px] bg-white z-50 flex flex-col overflow-hidden shadow-xl transition-all duration-200"
        style={{ width: '100vw', maxWidth: 466 }}
      >
        {/* Header */}
        <div className="border-b border-[#d9d9d9] h-12 flex items-center justify-between px-[22px] flex-shrink-0">
          <h2 className="text-xl font-medium text-[#212b36] font-poppins">{patient.name}</h2>
          <button
            onClick={onClose}
            className="cursor-pointer hover:opacity-70 transition-opacity p-1"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Download Button */}
        {onDownload && (
          <div className="flex justify-end px-[10px] py-3 border-b border-[#d9d9d9]">
            <button
              onClick={onDownload}
              className="border border-[#d9d9d9] rounded px-2.5 py-1 text-xs font-medium text-[#212b36] hover:bg-gray-50 transition-colors"
            >
              Download
            </button>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-[10px] py-6">
          <div className="flex flex-col gap-6 w-full max-w-[446px] mx-auto">
            {/* Patient Info Section */}
            <div className="flex flex-col gap-3">
              <div className="bg-[#e8f1ff] border-b-2 border-[#2c7be5] py-1 px-1">
                <h3 className="text-base font-medium text-[#212b36] font-poppins">Patient Info</h3>
              </div>

              <div className="flex flex-col gap-3">
                {/* Full Width Fields */}
                <div className="flex flex-col gap-0.5">
                  <label className="text-sm font-medium text-[#b1b9c0] font-poppins">LGA</label>
                  <div className="bg-white rounded h-7 flex items-center px-3 border border-[#d9d9d9]">
                    <p className="text-sm text-[#212b36] font-poppins">{patient.lga}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Select Community</label>
                  <div className="bg-white rounded h-7 flex items-center px-3 border border-[#d9d9d9]">
                    <p className="text-sm text-[#212b36] font-poppins">{patient.community}</p>
                  </div>
                </div>

                {/* Two Column Fields */}
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-0.5">
                    <label className="text-sm font-medium text-[#b1b9c0] font-poppins">First Name</label>
                    <div className="bg-white rounded h-7 flex items-center px-3 border border-[#d9d9d9]">
                      <p className="text-sm text-[#212b36] font-poppins">{patient.firstName}</p>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-0.5">
                    <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Last Name</label>
                    <div className="bg-white rounded h-7 flex items-center px-3 border border-[#d9d9d9]">
                      <p className="text-sm text-[#212b36] font-poppins">{patient.lastName}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-0.5">
                    <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Age</label>
                    <div className="bg-white rounded h-7 flex items-center px-3 border border-[#d9d9d9]">
                      <p className="text-sm text-[#212b36] font-poppins">{patient.age}</p>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col gap-0.5">
                    <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Gender</label>
                    <div className="bg-white rounded h-7 flex items-center px-3 border border-[#d9d9d9]">
                      <p className="text-sm text-[#212b36] font-poppins">{patient.gender}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Phone Number</label>
                  <div className="bg-white rounded h-7 flex items-center px-3 border border-[#d9d9d9]">
                    <p className="text-sm text-[#212b36] font-poppins">{patient.phoneNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Details Section */}
            {testDetails && (
              <div className="flex flex-col gap-3">
                <div className="bg-[#e8f1ff] border-b-2 border-[#2c7be5] py-1 px-1">
                  <h3 className="text-base font-medium text-[#212b36] font-poppins">Test Details</h3>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Test Type</label>
                    <div className="bg-white rounded h-7 flex items-center px-3 border border-[#d9d9d9]">
                      <p className="text-sm text-[#212b36] font-poppins">{testDetails.testType}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1 flex flex-col gap-0.5">
                      <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Test Result</label>
                      <div className="bg-white rounded h-7 flex items-center px-3 border border-[#d9d9d9]">
                        <p className="text-sm text-[#212b36] font-poppins">{testDetails.testResult}</p>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-0.5">
                      <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Date Conducted</label>
                      <div className="bg-white rounded h-7 flex items-center px-3 border border-[#d9d9d9]">
                        <p className="text-sm text-[#212b36] font-poppins">{testDetails.dateConducted}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Officer Note</label>
                    <div className="bg-white rounded p-2 border border-[#d9d9d9] min-h-12">
                      <p className="text-sm text-[#212b36] font-poppins line-clamp-3">{testDetails.officerNote}</p>
                    </div>
                  </div>

                  {testDetails.testSheetImage && (
                    <div className="flex flex-col gap-0.5">
                      <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Test Sheet</label>
                      <div className="bg-white rounded p-2 border border-[#d9d9d9] h-20">
                        <img
                          src={testDetails.testSheetImage}
                          alt="Test sheet"
                          className="h-full w-full object-cover rounded"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Patient Image Section */}
            {patientImage && (
              <div className="flex flex-col gap-3">
                <div className="bg-[#e8f1ff] border-b-2 border-[#2c7be5] py-1 px-1">
                  <h3 className="text-base font-medium text-[#212b36] font-poppins">Patient Image</h3>
                </div>

                <div className="flex flex-col gap-0.5">
                  <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Patient Photo</label>
                  <div className="bg-white rounded p-2 border border-[#d9d9d9] h-24">
                    <img src={patientImage} alt="Patient" className="h-full w-full object-cover rounded" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
