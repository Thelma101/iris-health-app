'use client';
import { useEffect, useState, useMemo } from 'react';
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

const PAGE_SIZE = 25;

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
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (isOpen && !patients && officerId) {
      setLoading(true);
      setSearchQuery('');
      setCurrentPage(1);
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

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const data = patients || apiPatients;

  // Filter by search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(p => p.name.toLowerCase().includes(q));
  }, [data, searchQuery]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, currentPage]);

  const displayTestType = testType || (data[0]?.testDetails?.[0]?.testType) || 'Test Results';

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <button className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] cursor-pointer" onClick={onClose} aria-label="Close modal" />

      <div className="fixed right-0 top-0 h-screen w-full sm:w-[466px] bg-white z-50 flex flex-col overflow-hidden shadow-xl">
          {/* Header */}
          <div className="bg-white border-b border-[#d9d9d9] h-12 flex items-center justify-between px-[22px] flex-shrink-0">
            <h2 className="text-xl font-medium text-[#212b36] font-poppins">{officerName} Test List</h2>
            <button
              onClick={onClose}
              className="text-[#637381] hover:text-[#212b36] transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search + Count Bar */}
          <div className="px-[22px] pt-3 pb-2 border-b border-[#f4f5f7] flex-shrink-0">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#b1b9c0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient name..."
                className="w-full pl-8 pr-3 py-1.5 text-[13px] font-poppins border border-[#d9d9d9] rounded-lg focus:outline-none focus:border-[#2c7be5] text-[#212b36] placeholder:text-[#b1b9c0]"
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-[12px] text-[#b1b9c0] font-poppins">{displayTestType}</p>
              <p className="text-[11px] text-[#637381] font-poppins">
                {loading ? '...' : `${filteredData.length} patient${filteredData.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {/* Content - scrollable list */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="px-[22px] pt-3 space-y-[12px] pb-3">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#2c7be5]" />
                </div>
              ) : filteredData.length === 0 ? (
                <p className="text-[#637381] text-[14px] font-poppins py-6 text-center">
                  {searchQuery ? 'No patients match your search' : 'No patients found'}
                </p>
              ) : (
                paginatedData.map((patient) => (
                  <button
                    type="button"
                    key={patient.patientId || patient.index}
                    onClick={() => onPatientSelect?.(patient)}
                    onKeyDown={(e) => e.key === 'Enter' && onPatientSelect?.(patient)}
                    className="flex gap-[10px] items-center text-[14px] font-regular font-poppins cursor-pointer transition-colors hover:bg-[#f4f5f7] text-left w-full bg-transparent border-none p-1.5 rounded-lg"
                  >
                    <span className="text-[#b1b9c0] w-[24px] flex-shrink-0 text-right text-[12px]">{patient.index}</span>
                    <span className="text-[#637381] flex-1 hover:text-[#2c7be5]">{patient.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Pagination Footer */}
          {!loading && filteredData.length > PAGE_SIZE && (
            <div className="border-t border-[#d9d9d9] px-[22px] py-2.5 flex items-center justify-between flex-shrink-0 bg-white">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="text-[12px] font-poppins text-[#2c7be5] hover:text-blue-700 disabled:text-[#d9d9d9] disabled:cursor-not-allowed cursor-pointer px-2 py-1"
              >
                &larr; Prev
              </button>
              <span className="text-[12px] font-poppins text-[#637381]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="text-[12px] font-poppins text-[#2c7be5] hover:text-blue-700 disabled:text-[#d9d9d9] disabled:cursor-not-allowed cursor-pointer px-2 py-1"
              >
                Next &rarr;
              </button>
            </div>
          )}
      </div>
    </>
  );
}
