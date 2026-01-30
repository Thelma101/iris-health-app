import React from 'react';
import { Patient } from '@/lib/constants/patients-data';

interface PatientsTableProps {
  patients: Patient[];
  onViewPatient?: (patient: Patient) => void;
  onEditPatient?: (patient: Patient) => void;
}

export default function PatientsTable({ patients, onViewPatient, onEditPatient }: PatientsTableProps) {
  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden sm:block rounded-lg bg-white border border-[#f4f5f7] overflow-hidden">
        <div className="overflow-x-auto max-h-[calc(100vh-320px)] overflow-y-auto">
          <table className="w-full min-w-[900px]">
            {/* Table Header */}
            <thead>
              <tr className="bg-[#f4f5f7] border-b border-[#f4f5f7]">
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#637381] font-poppins whitespace-nowrap w-[211px]">
                  Patient Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#637381] font-poppins whitespace-nowrap w-[60px]">
                  Age
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#637381] font-poppins whitespace-nowrap w-[60px]">
                  Gender
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#637381] font-poppins whitespace-nowrap w-[143px]">
                  Community
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#637381] font-poppins whitespace-nowrap w-[143px]">
                  LGA
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#637381] font-poppins whitespace-nowrap w-[92px]">
                  Tests Taken
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#637381] font-poppins whitespace-nowrap w-[117px]">
                  Last Test Result
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-[#637381] font-poppins whitespace-nowrap w-[144px]">
                  Action
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {patients.length > 0 ? (
                patients.map((patient) => (
                  <tr key={patient.id} className="border-b border-[#f4f5f7] hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3 text-sm text-[#637381] font-poppins whitespace-nowrap w-[211px]">
                      {patient.name}
                    </td>
                    <td className="px-6 py-3 text-sm text-[#637381] font-poppins whitespace-nowrap w-[60px]">
                      {patient.age}
                    </td>
                    <td className="px-6 py-3 text-sm text-[#637381] font-poppins whitespace-nowrap w-[60px]">
                      {patient.gender}
                    </td>
                    <td className="px-6 py-3 text-sm text-[#637381] font-poppins whitespace-nowrap w-[143px]">
                      {patient.community}
                    </td>
                    <td className="px-6 py-3 text-sm text-[#637381] font-poppins whitespace-nowrap w-[143px]">
                      {patient.lga}
                    </td>
                    <td className="px-6 py-3 text-sm text-[#637381] font-poppins whitespace-nowrap w-[92px]">
                      {patient.testsTaken}
                    </td>
                    <td className="px-6 py-3 text-sm text-[#637381] font-poppins whitespace-nowrap w-[117px]">
                      {patient.lastTestResult}
                    </td>
                    <td className="px-6 py-3 text-sm font-semibold text-center whitespace-nowrap w-[144px]">
                      <span
                        onClick={() => onViewPatient?.(patient)}
                        className="text-[#f4a100] cursor-pointer hover:underline mr-3"
                      >
                        View
                      </span>
                      <span
                        onClick={() => onEditPatient?.(patient)}
                        className="text-[#00c897] cursor-pointer hover:underline"
                      >
                        Edit
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

              {/* Last Test Result */}
              <div className="bg-[#f4f5f7] px-2.5 py-2 border-b border-[#d9d9d9]">
                <p className="font-semibold text-[#637381] text-[14px] font-poppins">Last Test Result</p>
              </div>
              <div className="px-2.5 py-1.5 border-b border-[#d9d9d9] bg-white">
                <p className="text-[#637381] text-[14px] font-poppins">{patient.lastTestResult}</p>
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
