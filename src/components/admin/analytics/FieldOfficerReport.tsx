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
    <div className="bg-white border border-[#d9d9d9] rounded-[12px] overflow-hidden w-full shadow-[0px_8px_25px_rgba(0,0,0,0.06)]">
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between bg-[#f8f9fb] border-b border-[#e4e7eb]">
        <p className="text-[16px] sm:text-[20px] font-semibold text-[#212b36] font-poppins">
          Field Officer Report
        </p>
      </div>
      <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
        <table className="w-full min-w-[320px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#eef2f7] border-b border-[#d9d9d9] text-left">
              <th className="px-3 sm:px-6 py-2.5 sm:py-3 w-[40%] sm:w-[45%]">
                <p className="text-[12px] sm:text-[14px] font-semibold text-[#212b36] font-poppins">Name</p>
              </th>
              <th className="px-2 sm:px-6 py-2.5 sm:py-3 w-[30%] sm:w-[35%]">
                <p className="text-[12px] sm:text-[14px] font-semibold text-[#212b36] font-poppins">No. Of Tests</p>
              </th>
              <th className="px-2 sm:px-6 py-2.5 sm:py-3 w-[30%] sm:w-[20%]">
                <p className="text-[12px] sm:text-[14px] font-semibold text-[#212b36] font-poppins">Action</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center">
                  <p className="text-[13px] sm:text-[14px] text-[#637381] font-poppins">Loading field officers...</p>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-10 text-center">
                  <p className="text-[13px] sm:text-[14px] text-[#637381] font-poppins">No field officers found</p>
                </td>
              </tr>
            ) : (
              data.map((officer) => (
                <tr
                  key={officer.id}
                  className="border-b border-[#e9edf1] hover:bg-[#f7f9fb] transition-colors"
                >
                  <td className="px-3 sm:px-6 py-2.5 sm:py-3">
                    <p className="text-[12px] sm:text-[14px] text-[#212b36] font-poppins truncate max-w-[100px] sm:max-w-none">{officer.name}</p>
                  </td>
                  <td className="px-2 sm:px-6 py-2.5 sm:py-3 text-left">
                    <p className="text-[12px] sm:text-[14px] text-[#212b36] font-poppins">{officer.testCount}</p>
                  </td>
                  <td className="px-2 sm:px-6 py-2.5 sm:py-3 text-left">
                    <button
                      className="inline-flex items-center gap-1 text-[#2c7be5] hover:underline text-[11px] sm:text-[14px] font-poppins whitespace-nowrap"
                      onClick={() => onViewTests?.(officer.id, officer.name)}
                    >
                      <span>View Tests</span>
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
