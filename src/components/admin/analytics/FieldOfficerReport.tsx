'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api/index';

interface OfficerReportRow {
  id: string;
  name: string;
  testCount: number;
}

interface FieldOfficerReportProps {
  officers?: OfficerReportRow[];
  onViewTests?: (officerId: string, officerName: string) => void;
}

export default function FieldOfficerReport({ officers, onViewTests }: Readonly<FieldOfficerReportProps>) {
  const [apiOfficers, setApiOfficers] = useState<OfficerReportRow[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getFieldOfficers()
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setApiOfficers(res.data);
        }
      })
      .catch((err) => {
        console.error('Error fetching officers:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const data = apiOfficers || officers || [];
  return (
    <div className="bg-white border border-[#d9d9d9] rounded-lg overflow-hidden w-full">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <p className="text-[18px] sm:text-[20px] font-semibold text-[#212b36] font-poppins">
          Field Officer Report
        </p>
      </div>
      <div className="overflow-x-auto max-h-[calc(100vh-400px)] overflow-y-auto">
        <table className="w-full min-w-[400px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#f4f5f7] border-b border-[#d9d9d9]">
              <th className="px-4 sm:px-6 py-3 text-left w-[45%] bg-[#f4f5f7]">
                <p className="text-[14px] sm:text-[16px] font-semibold text-[#212b36] font-poppins">Name</p>
              </th>
              <th className="px-4 sm:px-6 py-3 text-left w-[35%] bg-[#f4f5f7]">
                <p className="text-[14px] sm:text-[16px] font-semibold text-[#212b36] font-poppins">No. Of Tests</p>
              </th>
              <th className="px-4 sm:px-6 py-3 text-left w-[20%] bg-[#f4f5f7]">
                <p className="text-[14px] sm:text-[16px] font-semibold text-[#212b36] font-poppins">Action</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center">
                  <p className="text-[14px] text-gray-500 font-poppins">Loading field officers...</p>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center">
                  <p className="text-[14px] text-gray-500 font-poppins">No field officers found</p>
                </td>
              </tr>
            ) : (
              data.map((officer) => (
                <tr
                  key={officer.id}
                  className="border-b border-[#d9d9d9] hover:bg-[#f9f9f9] transition-colors"
                >
                  <td className="px-4 sm:px-6 py-3">
                    <p className="text-[13px] sm:text-[14px] text-[#212b36] font-poppins">{officer.name}</p>
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-left">
                    <p className="text-[13px] sm:text-[14px] text-[#212b36] font-poppins">{officer.testCount}</p>
                  </td>
                  <td className="px-4 sm:px-6 py-3 text-left">
                    <button
                      className="text-[#2c7be5] hover:underline text-[13px] sm:text-[14px] font-poppins whitespace-nowrap"
                      onClick={() => onViewTests?.(officer.id, officer.name)}
                    >
                      View Tests
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
