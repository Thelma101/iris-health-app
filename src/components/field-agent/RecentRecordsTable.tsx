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
      {/* Header */}
      <div className="bg-[#f4f5f7] px-1 py-1.5 flex items-center gap-[114px] font-poppins font-semibold text-sm text-[#637381]">
        <p className="w-[211px] px-1">Communities</p>
        <p className="w-[143px]">Total Test</p>
        <p className="w-[202px]">Top Tests +ve</p>
        <p className="w-[188px]">Top Tests -ve</p>
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-1">
        {records.map((record, index) => (
          <div
            key={record.id}
            className={`flex items-center gap-[114px] px-1 py-1.5 border-b border-[#e5e7eb] font-poppins text-sm text-[#637381] ${
              index % 2 === 0 ? 'bg-white' : 'bg-[rgba(242,244,244,0.21)]'
            }`}
          >
            <p className="w-[211px] px-1">{record.community}</p>
            <p className="w-[143px]">{record.totalTests}</p>
            <p className="w-[202px]">{record.topPositiveTest}</p>
            <p className="w-[188px]">{record.topNegativeTest}</p>
          </div>
        ))}
      </div>

      {records.length === 0 && (
        <div className="px-4 py-8 text-center text-[#637381] font-poppins text-sm">
          No records found
        </div>
      )}
    </div>
  );
}
