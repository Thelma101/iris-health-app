'use client';

import React from 'react';

interface PatientPdfViewProps {
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
}

export default function PatientPdfView({ patient, testDetails, patientImage }: PatientPdfViewProps) {
  return (
    <div className="bg-white w-full max-w-[595px] mx-auto p-8 space-y-6">
      {/* Patient Info Section */}
      <div className="space-y-3">
        <div className="bg-[#e8f1ff] border-b-2 border-[#2c7be5] py-1 px-1">
          <h3 className="text-base font-medium text-[#212b36] font-poppins">Patient Info</h3>
        </div>

        <div className="space-y-3">
          {/* Full Width Fields */}
          <div className="space-y-0.5">
            <label className="text-sm font-medium text-[#b1b9c0] font-poppins">LGA</label>
            <div className="bg-white h-7 flex items-center px-3">
              <p className="text-sm text-[#212b36] font-poppins">{patient?.lga}</p>
            </div>
          </div>

          <div className="space-y-0.5">
            <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Select Community</label>
            <div className="bg-white h-7 flex items-center px-3">
              <p className="text-sm text-[#212b36] font-poppins">{patient?.community}</p>
            </div>
          </div>

          {/* Two Column Fields */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-0.5">
              <label className="text-sm font-medium text-[#b1b9c0] font-poppins">First Name</label>
              <div className="bg-white h-7 flex items-center px-3">
                <p className="text-sm text-[#212b36] font-poppins">{patient?.firstName}</p>
              </div>
            </div>
            <div className="flex-1 space-y-0.5">
              <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Last Name</label>
              <div className="bg-white h-7 flex items-center px-3">
                <p className="text-sm text-[#212b36] font-poppins">{patient?.lastName}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-0.5">
              <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Age</label>
              <div className="bg-white h-7 flex items-center px-3">
                <p className="text-sm text-[#212b36] font-poppins">{patient?.age}</p>
              </div>
            </div>
            <div className="flex-1 space-y-0.5">
              <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Gender</label>
              <div className="bg-white h-7 flex items-center px-3">
                <p className="text-sm text-[#212b36] font-poppins">{patient?.gender}</p>
              </div>
            </div>
          </div>

          <div className="space-y-0.5">
            <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Phone Number</label>
            <div className="bg-white h-7 flex items-center px-3">
              <p className="text-sm text-[#212b36] font-poppins">{patient?.phoneNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Details Section */}
      {testDetails && (
        <div className="space-y-3">
          <div className="bg-[#e8f1ff] border-b-2 border-[#2c7be5] py-1 px-1">
            <h3 className="text-base font-medium text-[#212b36] font-poppins">Test Details</h3>
          </div>

          <div className="space-y-3">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Test Type</label>
              <div className="bg-white h-7 flex items-center px-3">
                <p className="text-sm text-[#212b36] font-poppins">{testDetails.testType}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 space-y-0.5">
                <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Test Result</label>
                <div className="bg-white h-7 flex items-center px-3">
                  <p className="text-sm text-[#212b36] font-poppins">{testDetails.testResult}</p>
                </div>
              </div>
              <div className="flex-1 space-y-0.5">
                <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Date Conducted</label>
                <div className="bg-white h-7 flex items-center px-3">
                  <p className="text-sm text-[#212b36] font-poppins">{testDetails.dateConducted}</p>
                </div>
              </div>
            </div>

            <div className="space-y-0.5">
              <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Officer Note</label>
              <div className="bg-white p-2 rounded min-h-12">
                <p className="text-sm text-[#212b36] font-poppins">{testDetails.officerNote}</p>
              </div>
            </div>

            {testDetails.testSheetImage && (
              <div className="space-y-0.5">
                <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Test Sheet</label>
                <div className="bg-white p-2 rounded h-56">
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
      {patientImage && (
        <div className="space-y-3">
          <div className="bg-[#e8f1ff] border-b-2 border-[#2c7be5] py-1 px-1">
            <h3 className="text-base font-medium text-[#212b36] font-poppins">Patient Image</h3>
          </div>

          <div className="space-y-0.5">
            <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Patient Photo</label>
            <div className="bg-white p-2 rounded h-24">
              <img src={patientImage} alt="Patient" className="h-full w-full object-cover rounded" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
