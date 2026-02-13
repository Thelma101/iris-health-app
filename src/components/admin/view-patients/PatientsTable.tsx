import React from 'react';
import { useRouter } from 'next/navigation';
import { Patient } from '@/lib/constants/patients-data';

interface PatientsTableProps {
  patients: Patient[];
  onViewPatient?: (patient: Patient) => void;
  onEditPatient?: (patient: Patient) => void;
}

export default function PatientsTable({ patients, onViewPatient, onEditPatient }: PatientsTableProps) {
  const router = useRouter();
  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden sm:block rounded-lg bg-white border border-[#f4f5f7] overflow-hidden">
        <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
          <table className="w-full table-fixed">
            {/* Table Header */}
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#f4f5f7] border-b border-[#f4f5f7]">
                <th className="px-3 py-3 text-left text-sm font-semibold text-[#637381] font-poppins bg-[#f4f5f7] w-[18%]">
                  Patient Name
                </th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-[#637381] font-poppins bg-[#f4f5f7] w-[6%]">
                  Age
                </th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-[#637381] font-poppins bg-[#f4f5f7] w-[8%]">
                  Gender
                </th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-[#637381] font-poppins bg-[#f4f5f7] w-[18%]">
                  Community
                </th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-[#637381] font-poppins bg-[#f4f5f7] w-[12%]">
                  LGA
                </th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-[#637381] font-poppins bg-[#f4f5f7] w-[8%]">
                  Tests Taken
                </th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-[#637381] font-poppins bg-[#f4f5f7] w-[16%]">
                  Last Test Type
                </th>
                <th className="px-3 py-3 text-center text-sm font-semibold text-[#637381] font-poppins bg-[#f4f5f7] w-[14%]">
                  Action
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {patients.length > 0 ? (
                patients.map((patient) => (
                  <tr key={patient.id} className="border-b border-[#f4f5f7] hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-3 text-sm text-[#637381] font-poppins break-words">
                      {patient.name}
                    </td>
                    <td className="px-3 py-3 text-sm text-[#637381] font-poppins">
                      {patient.age}
                    </td>
                    <td className="px-3 py-3 text-sm text-[#637381] font-poppins">
                      {patient.gender}
                    </td>
                    <td className="px-3 py-3 text-sm text-[#637381] font-poppins break-words">
                      {patient.community}
                    </td>
                    <td className="px-3 py-3 text-sm text-[#637381] font-poppins break-words">
                      {patient.lga}
                    </td>
                    <td className="px-3 py-3 text-sm text-[#637381] font-poppins">
                      {patient.testsTaken}
                    </td>
                    <td className="px-3 py-3 text-sm text-[#637381] font-poppins break-words">
                      {patient.lastTestType}
                    </td>
                    <td className="px-3 py-3 text-sm font-semibold text-center">
                      <span
                        onClick={() => onViewPatient?.(patient)}
                        className="text-[#f4a100] cursor-pointer hover:underline mr-3"
                      >
                        View
                      </span>
                      <span
                        onClick={() => onEditPatient?.(patient)}
                        className="text-[#00c897] cursor-pointer hover:underline mr-3"
                      >
                        Edit
                      </span>
                      <span
                        onClick={() => router.push(`/dashboard/patient-report?id=${patient._id || patient.id}`)}
                        className="text-[#2c7be5] cursor-pointer hover:underline"
                      >
                        Report
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-sm text-[#637381]">
                    No patients found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View - Matches Figma Design */}
      <div className="sm:hidden flex flex-col gap-4">
        {patients.length > 0 ? (
          patients.map((patient) => (
            <div key={patient.id} className="border border-[#d9d9d9] rounded-[4px] overflow-hidden bg-white">
              {/* Patient Name */}
              <div className="bg-[#f4f5f7] px-2.5 py-2 border-b border-[#d9d9d9]">
                <p className="font-semibold text-[#637381] text-[14px] font-poppins">Patient Name</p>
              </div>
              <div className="px-2.5 py-1.5 border-b border-[#d9d9d9] bg-white">
                <p className="text-[#637381] text-[14px] font-poppins">{patient.name}</p>
              </div>

              {/* Age */}
              <div className="bg-[#f4f5f7] px-2.5 py-2 border-b border-[#d9d9d9]">
                <p className="font-semibold text-[#637381] text-[14px] font-poppins">Age</p>
              </div>
              <div className="px-2.5 py-1.5 border-b border-[#d9d9d9] bg-white">
                <p className="text-[#637381] text-[14px] font-poppins">{patient.age}yrs</p>
              </div>

              {/* Gender */}
              <div className="bg-[#f4f5f7] px-2.5 py-2 border-b border-[#d9d9d9]">
                <p className="font-semibold text-[#637381] text-[14px] font-poppins">Gender</p>
              </div>
              <div className="px-2.5 py-1.5 border-b border-[#d9d9d9] bg-white">
                <p className="text-[#637381] text-[14px] font-poppins">{patient.gender}</p>
              </div>

              {/* Community */}
              <div className="bg-[#f4f5f7] px-2.5 py-2 border-b border-[#d9d9d9]">
                <p className="font-semibold text-[#637381] text-[14px] font-poppins">Community</p>
              </div>
              <div className="px-2.5 py-1.5 border-b border-[#d9d9d9] bg-white">
                <p className="text-[#637381] text-[14px] font-poppins">{patient.community}</p>
              </div>

              {/* LGA */}
              <div className="bg-[#f4f5f7] px-2.5 py-2 border-b border-[#d9d9d9]">
                <p className="font-semibold text-[#637381] text-[14px] font-poppins">LGA</p>
              </div>
              <div className="px-2.5 py-1.5 border-b border-[#d9d9d9] bg-white">
                <p className="text-[#637381] text-[14px] font-poppins">{patient.lga}</p>
              </div>

              {/* Tests Taken */}
              <div className="bg-[#f4f5f7] px-2.5 py-2 border-b border-[#d9d9d9]">
                <p className="font-semibold text-[#637381] text-[14px] font-poppins">Tests Taken</p>
              </div>
              <div className="px-2.5 py-1.5 border-b border-[#d9d9d9] bg-white">
                <p className="text-[#637381] text-[14px] font-poppins">{patient.testsTaken}</p>
              </div>

              {/* Last Test Type */}
              <div className="bg-[#f4f5f7] px-2.5 py-2 border-b border-[#d9d9d9]">
                <p className="font-semibold text-[#637381] text-[14px] font-poppins">Last Test Type</p>
              </div>
              <div className="px-2.5 py-1.5 border-b border-[#d9d9d9] bg-white">
                <p className="text-[#637381] text-[14px] font-poppins">{patient.lastTestType}</p>
              </div>

              {/* Action */}
              <div className="bg-[#f4f5f7] px-2.5 py-2 border-b border-[#d9d9d9]">
                <p className="font-semibold text-[#637381] text-[14px] font-poppins">Action</p>
              </div>
              <div className="px-2.5 py-1.5 bg-white flex gap-4">
                <button
                  onClick={() => onViewPatient?.(patient)}
                  className="text-[14px] text-[#f4a100] font-poppins hover:underline transition-colors cursor-pointer font-medium"
                >
                  View
                </button>
                <button
                  onClick={() => onEditPatient?.(patient)}
                  className="text-[14px] text-[#00c897] font-poppins hover:underline transition-colors cursor-pointer font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => router.push(`/dashboard/patient-report?id=${patient._id || patient.id}`)}
                  className="text-[14px] text-[#2c7be5] font-poppins hover:underline transition-colors cursor-pointer font-medium"
                >
                  Report
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 gap-4 border border-[#d9d9d9] rounded-[4px] bg-white">
            <svg className="w-[34px] h-[34px] text-[#637381]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-[#637381] text-[14px] font-poppins text-center">No recorded patient yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
