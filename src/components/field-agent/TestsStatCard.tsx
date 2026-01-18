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
    <div className="bg-[#fbeaea] rounded-[10px] px-4 sm:px-5 py-3 flex flex-col gap-4 w-full max-w-full lg:max-w-[520px]">
      {/* Title */}
      <p className="font-poppins font-medium text-base text-[#212b36]">
        Tests
      </p>

      {/* Stats Row */}
      <div className="flex items-center justify-between gap-4">
        {/* Count and Description */}
        <div className="flex flex-col flex-1 min-w-0">
          <p className="font-poppins font-semibold text-2xl sm:text-[32px] text-[#212b36]">
            {totalTests.toLocaleString()}
          </p>
          <p className="font-poppins text-xs text-[#637381] truncate">
            {totalTests.toLocaleString()} tests carried out as at {lastTestDate}
          </p>
        </div>

        {/* Icon */}
        <div className="w-10 h-10 sm:w-[45px] sm:h-[45px] bg-white rounded-full flex items-center justify-center flex-shrink-0">
          <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-[29px] sm:h-[29px]">
            <path d="M8.5 4.5V8.5M8.5 8.5V24.5L11.5 22.5L14.5 24.5L17.5 22.5L20.5 24.5V8.5M8.5 8.5H20.5M20.5 4.5V8.5M12 12.5H17M12 16.5H17" stroke="#d64545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 sm:h-3.5 bg-white rounded-lg overflow-hidden">
        <div 
          className="h-full bg-[#d64545] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
