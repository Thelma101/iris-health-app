'use client';

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
  const defaultOfficers = [
    { id: '1', name: 'Jerome Bell', testCount: 67 },
    { id: '2', name: 'Wade Warren', testCount: 67 },
    { id: '3', name: 'Annette Black', testCount: 67 },
    { id: '4', name: 'Darlene Robertson', testCount: 67 },
  ];

  const data = officers || defaultOfficers;

  return (
    <div className="bg-white border border-[#d9d9d9] rounded-[8px] overflow-hidden w-full">
      {/* Title */}
      <div className="px-[15px] sm:px-[18px] py-[11px] sm:py-[14px]">
        <p className="text-[16px] sm:text-[18px] font-semibold text-[#212b36] font-poppins capitalize">
          Field officer report
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[400px]">
          {/* Header Row */}
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

          {/* Data Rows */}
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
                    onClick={() => onViewTests?.(officer.id, officer.name)}
                    className="text-[12px] sm:text-[14px] text-[#2c7be5] hover:underline cursor-pointer capitalize font-poppins"
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
