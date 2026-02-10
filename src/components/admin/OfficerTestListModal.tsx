'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import ModalBackdrop from './ModalBackdrop';
import api from '@/lib/api/index';

export interface PatientTestRecord {
  index: number;
  name: string;
  patientId: string;
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  phoneNumber: string;
  community: string;
  lga: string;
  testDetails: Array<{
    testType: string;
    testResult: string;
    dateConducted: string;
    officerNote: string;
    heightCm?: number;
    weightKg?: number;
    bmi?: number;
    bmiCategory?: string;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    bpCategory?: string;
    glucoseLevel?: number;
    glucoseUnit?: string;
  }>;
}

interface OfficerTestListModalProps {
  isOpen: boolean;
  onClose: () => void;
  officerId: string;
  officerName: string;
  testType?: string;
  patients?: PatientTestRecord[];
  onPatientSelect?: (patient: PatientTestRecord) => void;
}

export default function OfficerTestListModal({
  isOpen,
  onClose,
  officerId,
  officerName,
  testType,
  patients,
  onPatientSelect,
}: Readonly<OfficerTestListModalProps>) {
  const [apiPatients, setApiPatients] = useState<PatientTestRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && !patients && officerId) {
      setLoading(true);
      // Fetch patients filtered by this officer
      api.getPatientsByOfficer(officerId)
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setApiPatients(res.data as PatientTestRecord[]);
          } else {
            setApiPatients([]);
          }
        })
        .catch((err) => {
          console.error('Error fetching patients by officer:', err);
          setApiPatients([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, patients, officerId]);

  const data = patients || apiPatients;
  // Get display test type from first patient's test or fallback
  const displayTestType = testType || (data[0]?.testDetails?.[0]?.testType) || 'Test Results';

  if (!isOpen) return null;

  return (
    <>
      <ModalBackdrop onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center sm:items-start sm:justify-end pointer-events-none">
        <div className="bg-white w-full max-w-[411px] h-screen pointer-events-auto sm:rounded-none shadow-xl m-0">
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
              <p className="text-[14px] font-regular text-[#b1b9c0] font-poppins">{displayTestType}</p>

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
                      key={patient.patientId || patient.index}
                      onClick={() => onPatientSelect?.(patient)}
                      onKeyDown={(e) => e.key === 'Enter' && onPatientSelect?.(patient)}
                      className={`flex gap-[10px] items-center text-[14px] font-regular font-poppins cursor-pointer transition-colors hover:text-[#2c7be5] text-left w-full bg-transparent border-none p-0 ${idx === 2 ? 'bg-[#f4f5f7] -mx-[22px] px-[22px] py-2' : ''
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
