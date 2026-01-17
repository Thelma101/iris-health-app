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
    <div className="bg-white border border-[#d9d9d9] rounded-[8px] overflow-hidden w-full">
      <div className="px-[15px] sm:px-[18px] py-[11px] sm:py-[14px]">
        <p className="text-[16px] sm:text-[18px] font-semibold text-[#212b36] font-poppins capitalize">
          Field officer report
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr className="bg-[#f4f5f7] border-b border-[#d9d9d9]">
              <th className="px-[10px] sm:px-[15px] py-[10px] text-left">
                <p className="text-[14px] sm:text-[18px] font-semibold text-[#212b36] font-poppins capitalize">Name</p>
              </th>
              <th className="px-[10px] sm:px-[15px] py-[10px] text-center">
                <p className="text-[14px] sm:text-[18px] font-semibold text-[#212b36] font-poppins capitalize">No. of Tests</p>
              </th>
              <th className="px-[10px] sm:px-[15px] py-[10px] text-right">
                <p className="text-[14px] sm:text-[18px] font-semibold text-[#212b36] font-poppins capitalize">Action</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((officer) => (
              <tr
                key={officer.id}
                className="border-b border-[#d9d9d9] hover:bg-[#f9f9f9] transition-colors"
              >
                <td className="px-[10px] sm:px-[15px] py-[10px]">
                  <p className="text-[12px] sm:text-[14px] text-[#212b36] font-poppins capitalize">{officer.name}</p>
                </td>
                <td className="px-[10px] sm:px-[15px] py-[10px] text-center">
                  <p className="text-[12px] sm:text-[14px] text-[#212b36] font-poppins">{officer.testCount}</p>
                </td>
                <td className="px-[10px] sm:px-[15px] py-[10px] text-right">
                  <button
                    className="text-[#2c7be5] hover:underline text-[12px] sm:text-[14px] font-poppins"
                    onClick={() => onViewTests?.(officer.id, officer.name)}
                  >
                    View Tests
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
