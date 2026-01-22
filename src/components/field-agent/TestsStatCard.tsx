'use client';

import Image from 'next/image';

interface TestsStatCardProps {
  totalTests: number;
  lastTestDate: string;
  progress?: number; // 0-100
}

export default function TestsStatCard({ 
  totalTests, 
  lastTestDate, 
  progress = 40 
}: TestsStatCardProps) {
  return (
    <div className="bg-[#fbeaea] rounded-[10px] px-5 py-3 flex flex-col gap-4 w-full max-w-full lg:max-w-[420px]">
        {/* Title */}
        <p className="font-poppins font-medium text-base text-[#212b36]">
          Tests
        </p>

        {/* Stats Row */}
        <div className="flex items-center justify-between gap-[88px]">
          {/* Count and Description */}
          <div className="flex flex-col flex-1 min-w-0">
            <p className="font-poppins font-semibold text-[32px] text-[#212b36] leading-none">
              {totalTests.toLocaleString()}
            </p>
            <p className="font-poppins text-xs text-[#637381] mt-1">
              {totalTests.toLocaleString()} tests carried out as at {lastTestDate}
            </p>
          </div>

          {/* Icon - Same as admin dashboard (tests-icon.png) */}
          <div className="w-[45px] h-[45px] relative bg-white rounded-[30px] overflow-hidden shrink-0">
            <Image
              src="/icons/tests-icon.png"
              alt="Tests"
              width={29}
              height={29}
              className="absolute left-[8px] top-1/2 -translate-y-1/2 object-cover"
            />
          </div>
        </div>

      {/* Progress Bar */}
      <div className="w-full h-3.5 bg-white rounded-lg overflow-hidden">
        <div 
          className="h-full bg-[#d64545] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
