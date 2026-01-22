'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import ModalBackdrop from './ModalBackdrop';
import api from '@/lib/api/index';

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
}: Readonly<OfficerTestListModalProps>) {
  const [apiPatients, setApiPatients] = useState<PatientTestRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && !patients) {
      setLoading(true);
      api.getPatients()
        .then((res) => {
          const patData = res.data as any;
          const patientsArray = patData?.data?.patients || patData?.patients || [];
          const mapped = patientsArray.map((p: any, idx: number) => ({
            index: idx + 1,
            name: `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Unknown',
          }));
          setApiPatients(mapped);
        })
        .catch((err) => {
          console.error('Error fetching patients:', err);
          setApiPatients([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, patients]);

  const data = patients || apiPatients;

  if (!isOpen) return null;

  return (
    <>
      <ModalBackdrop onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center sm:items-start sm:justify-end pointer-events-none px-4 sm:px-0">
        <div className="bg-white w-full max-w-[411px] max-h-[90vh] sm:max-h-screen pointer-events-auto rounded-lg sm:rounded-br-lg shadow-xl mx-auto sm:mx-0">
          {/* Header */}
          <div className="bg-white border-b border-[#d9d9d9] h-[48px] flex items-center justify-between px-[22px]">
            <h2 className="text-[20px] font-medium text-[#212b36] font-poppins">{officerName} Test List</h2>
            <button
              onClick={onClose}
              className="text-[#637381] hover:text-[#212b36] transition-colors"
            >
              <Image src="/icons/cancel-01.svg" alt="Close" width={24} height={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-0 overflow-y-auto max-h-[calc(100vh-48px)]">
            <div className="px-[22px] pt-[23px] space-y-[23px]">
              {/* Test Type Label */}
              <p className="text-[14px] font-regular text-[#b1b9c0] font-poppins">{testType}</p>

              {/* Patient List */}
              <div className="space-y-[17px]">
                {loading ? (
                  <p className="text-[#637381] text-[14px] font-poppins">Loading patients...</p>
                ) : data.length === 0 ? (
                  <p className="text-[#637381] text-[14px] font-poppins">No patients found</p>
                ) : (
                  data.map((patient, idx) => (
                    <button
                      type="button"
                      key={patient.index}
                      onClick={() => onPatientSelect?.(patient.name)}
                      onKeyDown={(e) => e.key === 'Enter' && onPatientSelect?.(patient.name)}
                      className={`flex gap-[10px] items-center text-[14px] font-regular font-poppins cursor-pointer transition-colors hover:text-[#2c7be5] text-left w-full bg-transparent border-none p-0 ${
                        idx === 2 ? 'bg-[#f4f5f7] -mx-[22px] px-[22px] py-2' : ''
                      }`}
                    >
                      <span className="text-[#637381] w-[16px] flex-shrink-0">{patient.index}</span>
                      <span className="text-[#637381] flex-1 hover:text-[#2c7be5]">{patient.name}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
