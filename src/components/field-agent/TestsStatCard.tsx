'use client';

import Image from 'next/image';

interface TestsStatCardProps {
  totalTests: number;
  lastTestDate: string;
  progress?: number;
}

export default function TestsStatCard({
  totalTests,
  lastTestDate,
  progress = 40
}: TestsStatCardProps) {
  return (
    <div className="bg-[#fbeaea] rounded-[10px] px-4 sm:px-5 py-3 flex flex-col gap-3 sm:gap-4 w-full">
      <p className="font-poppins font-medium text-sm sm:text-base text-[#212b36]">
        Tests
      </p>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col flex-1 min-w-0">
          <p className="font-poppins font-semibold text-2xl sm:text-[32px] text-[#212b36] leading-none">
            {totalTests.toLocaleString()}
          </p>
          <p className="font-poppins text-[10px] sm:text-xs text-[#637381] mt-1">
            {totalTests.toLocaleString()} tests carried out as at {lastTestDate}
          </p>
        </div>

        <div className="w-10 h-10 sm:w-[45px] sm:h-[45px] relative bg-white rounded-full overflow-hidden shrink-0 flex items-center justify-center">
          <Image
            src="/icons/tests-icon.png"
            alt="Tests"
            width={29}
            height={29}
            className="object-cover w-6 h-6 sm:w-[29px] sm:h-[29px]"
          />
        </div>
      </div>

      <div className="w-full h-3 sm:h-3.5 bg-white rounded-lg overflow-hidden">
        <div
          className="h-full bg-[#d64545] rounded-lg transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
