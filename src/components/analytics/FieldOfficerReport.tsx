'use client';

import React from 'react';

interface OfficerReportRow {
  id: string;
  name: string;
  testCount: number;
}

interface FieldOfficerReportProps {
  officers?: OfficerReportRow[];
  onViewTests?: (officerId: string, officerName: string) => void;
}

export default function FieldOfficerReport({ officers, onViewTests }: FieldOfficerReportProps) {
  const defaultOfficers = [
    { id: '1', name: 'Jerome Bell', testCount: 67 },
    { id: '2', name: 'Wade Warren', testCount: 41 },
  ];

  const data = officers || defaultOfficers;

  return (
    <div className="bg-white border border-[#d9d9d9] rounded-[8px] overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-[15px] py-4 bg-[#f4f5f7] border-b border-[#d9d9d9]">
        <h3 className="text-[18px] font-semibold text-[#212b36] font-poppins">Field Officer Report</h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#d9d9d9] bg-[#f4f5f7]">
              <th className="px-4 sm:px-[15px] py-[10px] text-left">
                <p className="text-[18px] font-semibold uppercase text-[#212b36] font-poppins">Name</p>
              </th>
              <th className="px-4 sm:px-[15px] py-[10px] text-left">
                <p className="text-[18px] font-semibold uppercase text-[#212b36] font-poppins">No. Of Tests</p>
              </th>
              <th className="px-4 sm:px-[15px] py-[10px] text-right">
                <p className="text-[18px] font-semibold uppercase text-[#212b36] font-poppins">Action</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((officer, index) => (
              <tr key={officer.id} className="border-b border-[#d9d9d9] hover:bg-[#f4f5f7] transition-colors">
                <td className="px-4 sm:px-[15px] py-[10px]">
                  <p className="text-[14px] text-[#212b36] font-poppins font-regular">{officer.name}</p>
                </td>
                <td className="px-4 sm:px-[15px] py-[10px]">
                  <p className="text-[14px] text-[#212b36] font-poppins font-regular">{officer.testCount}</p>
                </td>
                <td className="px-4 sm:px-[15px] py-[10px] text-right">
                  <button
                    onClick={() => onViewTests?.(officer.id, officer.name)}
                    className="text-[14px] text-[#2c7be5] font-poppins font-regular hover:underline transition-colors cursor-pointer"
                  >
                    View tests
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
