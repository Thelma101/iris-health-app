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

// Vertical card layout for mobile
function RecordCard({ record }: { record: RecentRecord }) {
  return (
    <div className="border border-[#d9d9d9] rounded-lg overflow-hidden">
      {/* Communities Row */}
      <div className="bg-[#f4f5f7] px-2.5 py-2">
        <p className="font-poppins font-semibold text-sm text-[#637381]">Communities</p>
      </div>
      <div className="px-2.5 py-1.5">
        <p className="font-poppins text-sm text-[#637381]">{record.community}</p>
      </div>
      
      {/* Total Test Row */}
      <div className="bg-[#f4f5f7] px-2.5 py-2">
        <p className="font-poppins font-semibold text-sm text-[#637381]">Total Test</p>
      </div>
      <div className="px-2.5 py-1.5">
        <p className="font-poppins text-sm text-[#637381]">{record.totalTests}</p>
      </div>
      
      {/* Top Tests +ve Row */}
      <div className="bg-[#f4f5f7] px-2.5 py-2">
        <p className="font-poppins font-semibold text-sm text-[#637381]">Top Tests +ve</p>
      </div>
      <div className="px-2.5 py-1.5">
        <p className="font-poppins text-sm text-[#637381]">{record.topPositiveTest}</p>
      </div>
      
      {/* Top Tests -ve Row */}
      <div className="bg-[#f4f5f7] px-2.5 py-2">
        <p className="font-poppins font-semibold text-sm text-[#637381]">Top Tests -ve</p>
      </div>
      <div className="px-2.5 py-1.5">
        <p className="font-poppins text-sm text-[#637381]">{record.topNegativeTest}</p>
      </div>
    </div>
  );
}

// Table row for desktop
function TableRow({ record, isEven }: { record: RecentRecord; isEven: boolean }) {
  return (
    <tr className={isEven ? 'bg-white' : 'bg-[#f4f5f7]'}>
      <td className="px-4 py-3 font-poppins text-sm text-[#637381]">{record.community}</td>
      <td className="px-4 py-3 font-poppins text-sm text-[#637381] text-center">{record.totalTests}</td>
      <td className="px-4 py-3 font-poppins text-sm text-[#637381]">{record.topPositiveTest}</td>
      <td className="px-4 py-3 font-poppins text-sm text-[#637381]">{record.topNegativeTest}</td>
    </tr>
  );
}

export default function RecentRecordsTable({ records }: RecentRecordsTableProps) {
  if (records.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-[#637381] font-poppins text-sm border border-[#d9d9d9] rounded-lg">
        No records found
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block border border-[#d9d9d9] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f4f5f7] border-b border-[#d9d9d9]">
              <th className="px-4 py-3 text-left font-poppins font-semibold text-sm text-[#637381]">Communities</th>
              <th className="px-4 py-3 text-center font-poppins font-semibold text-sm text-[#637381]">Total Test</th>
              <th className="px-4 py-3 text-left font-poppins font-semibold text-sm text-[#637381]">Top Tests +ve</th>
              <th className="px-4 py-3 text-left font-poppins font-semibold text-sm text-[#637381]">Top Tests -ve</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <TableRow key={record.id} record={record} isEven={index % 2 === 0} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden flex flex-col gap-4">
        {records.map((record) => (
          <RecordCard key={record.id} record={record} />
        ))}
      </div>
    </>
  );
}
