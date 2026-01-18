'use client';

interface RecentRecord {
  id: string;
  community: string;
  totalTests: number;
  topPositiveTest: string;
  topNegativeTest: string;
}

interface RecentRecordsTableProps {
  records: RecentRecord[];
}

export default function RecentRecordsTable({ records }: RecentRecordsTableProps) {
  return (
    <div className="border border-[#d9d9d9] rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          {/* Header */}
          <thead>
            <tr className="bg-[#f4f5f7]">
              <th className="px-3 py-2 text-left font-poppins font-semibold text-sm text-[#637381] w-[30%]">Communities</th>
              <th className="px-3 py-2 text-left font-poppins font-semibold text-sm text-[#637381] w-[20%]">Total Test</th>
              <th className="px-3 py-2 text-left font-poppins font-semibold text-sm text-[#637381] w-[25%]">Top Tests +ve</th>
              <th className="px-3 py-2 text-left font-poppins font-semibold text-sm text-[#637381] w-[25%]">Top Tests -ve</th>
            </tr>
          </thead>

          {/* Rows */}
          <tbody>
            {records.map((record, index) => (
              <tr
                key={record.id}
                className={`border-b border-[#e5e7eb] ${index % 2 === 0 ? 'bg-white' : 'bg-[rgba(242,244,244,0.21)}'}`}
              >
                <td className="px-3 py-2 font-poppins text-sm text-[#637381]">{record.community}</td>
                <td className="px-3 py-2 font-poppins text-sm text-[#637381]">{record.totalTests}</td>
                <td className="px-3 py-2 font-poppins text-sm text-[#637381]">{record.topPositiveTest}</td>
                <td className="px-3 py-2 font-poppins text-sm text-[#637381]">{record.topNegativeTest}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {records.length === 0 && (
        <div className="px-4 py-8 text-center text-[#637381] font-poppins text-sm">
          No records found
        </div>
      )}
    </div>
  );
}
