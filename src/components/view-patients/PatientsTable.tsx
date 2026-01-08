import React from 'react';
import { Patient } from '@/lib/constants/patients-data';

interface PatientsTableProps {
  patients: Patient[];
  onViewPatient?: (patient: Patient) => void;
  onEditPatient?: (patient: Patient) => void;
}

export default function PatientsTable({ patients, onViewPatient, onEditPatient }: PatientsTableProps) {
  return (
    <div className="w-full rounded-lg bg-white border border-[#d9d9d9] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
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
  );
}
