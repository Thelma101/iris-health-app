'use client';

import React from 'react';
import ModalBackdrop from './ModalBackdrop';

const imgCancel01 = 'https://www.figma.com/api/mcp/asset/e97b51de-7fa7-4776-b957-44ca50739ef6';

interface PatientTestRecord {
  index: number;
  name: string;
}

interface OfficerTestListModalProps {
  isOpen: boolean;
  onClose: () => void;
  officerName: string;
  testType: string;
  patients?: PatientTestRecord[];
  onPatientSelect?: (patientName: string) => void;
}

export default function OfficerTestListModal({
  isOpen,
  onClose,
  officerName,
  testType,
  patients,
  onPatientSelect,
}: OfficerTestListModalProps) {
  const defaultPatients: PatientTestRecord[] = [
    { index: 1, name: 'Kathryn Murphy' },
    { index: 2, name: 'Jerome Bell' },
  ];

  const data = patients || defaultPatients;

  if (!isOpen) return null;

  return (
    <>
      <ModalBackdrop onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-start justify-start pointer-events-none">
        <div className="bg-white w-full max-w-[411px] max-h-screen pointer-events-auto rounded-br-lg shadow-xl">
          {/* Header */}
          <div className="bg-white border-b border-[#d9d9d9] h-[48px] flex items-center justify-between px-[22px]">
            <h2 className="text-[20px] font-medium text-[#212b36] font-poppins">{officerName} Test List</h2>
            <button
              onClick={onClose}
              className="text-[#637381] hover:text-[#212b36] transition-colors"
            >
              <img src={imgCancel01} alt="Close" className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-0 overflow-y-auto max-h-[calc(100vh-48px)]">
            <div className="px-[22px] pt-[23px] space-y-[23px]">
              {/* Test Type Label */}
              <p className="text-[14px] font-regular text-[#b1b9c0] font-poppins">{testType}</p>

              {/* Patient List */}
              <div className="space-y-[17px]">
                {data.map((patient, idx) => (
                  <div
                    key={patient.index}
                    onClick={() => onPatientSelect?.(patient.name)}
                    className={`flex gap-[10px] items-center text-[14px] font-regular font-poppins cursor-pointer transition-colors hover:text-[#2c7be5] ${
                      idx === 2 ? 'bg-[#f4f5f7] -mx-[22px] px-[22px] py-2' : ''
                    }`}
                  >
                    <span className="text-[#637381] w-[16px] flex-shrink-0">{patient.index}</span>
                    <span className="text-[#637381] flex-1 hover:text-[#2c7be5]">{patient.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
