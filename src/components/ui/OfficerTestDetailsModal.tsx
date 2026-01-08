'use client';

import React from 'react';

const imgCancel01 = 'https://www.figma.com/api/mcp/asset/e97b51de-7fa7-4776-b957-44ca50739ef6';

interface PatientTestDetail {
  testType: string;
  testResult: string;
  dateConducted: string;
  officerNote: string;
  testSheetImage?: string;
  patientImage?: string;
}

interface OfficerTestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  testDetails?: PatientTestDetail;
}

export default function OfficerTestDetailsModal({
  isOpen,
  onClose,
  patientName,
  testDetails,
}: OfficerTestDetailsModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-white/30 backdrop-blur-sm cursor-pointer" onClick={onClose} />

      {/* Modal Drawer - Right Side */}
      <div className="fixed right-0 top-0 h-screen w-[466px] bg-white z-50 flex flex-col overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-white border-b border-[#d9d9d9] h-12 flex items-center justify-between px-[22px] flex-shrink-0">
          <h2 className="text-xl font-medium text-[#212b36] font-poppins">{patientName}</h2>
          <button
            onClick={onClose}
            className="text-[#637381] hover:text-[#212b36] transition-colors"
          >
            <img src={imgCancel01} alt="Close" className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Test Details Section */}
          {testDetails && (
            <div className="space-y-4">
              <div className="bg-[#e8f1ff] border-b-2 border-[#2c7be5] py-2 px-3 mb-3">
                <h3 className="text-base font-medium text-[#212b36] font-poppins">Test Details</h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Test Type</label>
                  <div className="bg-white h-7 flex items-center px-3 border border-[#d9d9d9] rounded">
                    <p className="text-sm text-[#212b36] font-poppins">{testDetails.testType}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Test Result</label>
                    <div className="bg-white h-7 flex items-center px-3 border border-[#d9d9d9] rounded">
                      <p className="text-sm text-[#212b36] font-poppins">{testDetails.testResult}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Date Conducted</label>
                    <div className="bg-white h-7 flex items-center px-3 border border-[#d9d9d9] rounded">
                      <p className="text-sm text-[#212b36] font-poppins">{testDetails.dateConducted}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Officer Note</label>
                  <div className="bg-white p-3 border border-[#d9d9d9] rounded min-h-20">
                    <p className="text-sm text-[#212b36] font-poppins">{testDetails.officerNote}</p>
                  </div>
                </div>

                {testDetails.testSheetImage && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Test Sheet</label>
                    <div className="bg-white p-3 border border-[#d9d9d9] rounded h-48">
                      <img
                        src={testDetails.testSheetImage}
                        alt="Test sheet"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Patient Image Section */}
          {testDetails?.patientImage && (
            <div className="space-y-3">
              <div className="bg-[#e8f1ff] border-b-2 border-[#2c7be5] py-2 px-3 mb-3">
                <h3 className="text-base font-medium text-[#212b36] font-poppins">Patient Image</h3>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Patient Photo</label>
                <div className="bg-white p-3 border border-[#d9d9d9] rounded h-24">
                  <img
                    src={testDetails.patientImage}
                    alt="Patient"
                    className="h-full w-full object-cover rounded"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
