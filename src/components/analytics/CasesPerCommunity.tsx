'use client';

import React from 'react';

interface CasesPerCommunityProps {
  data?: Array<{
    label: string;
    value: number;
  }>;
}

export default function CasesPerCommunity({ data }: CasesPerCommunityProps) {
  const defaultData = [
    { label: 'Tee George', value: 89 },
    { label: 'Green Lunar', value: 73 },
    { label: '3', value: 78 },
    { label: '4', value: 21 },
    { label: '5', value: 18 },
  ];

  const chartData = data || defaultData;
  const maxValue = Math.max(...chartData.map((d) => d.value));

  return (
    <div
      className="bg-white border border-[#d9d9d9] rounded-[8px] p-4 sm:p-7 flex flex-col min-h-[300px]"
      style={{
        backgroundImage: 'linear-gradient(118.89deg, rgba(255, 249, 230, 0.29) 3.64%, rgba(232, 241, 255, 0.29) 100.8%)',
      }}
    >
      {/* Title */}
      <div className="mb-4 sm:mb-6">
        <h3 className="text-[16px] sm:text-[18px] font-semibold text-[#212b36] font-poppins">Cases Per Community</h3>
        <p className="text-[10px] text-[#b1b9c0] font-poppins mt-1">Number of test carried on every visit</p>
      </div>

      {/* Chart Area */}
      <div className="flex-1 flex items-end justify-center gap-4 sm:gap-12 relative mb-4 sm:mb-8 h-48 sm:h-64 overflow-x-auto">
        {/* Y-axis line */}
        <div className="absolute left-2 sm:left-8 top-0 bottom-0 w-[2px] bg-[#d9d9d9]" />

        {/* Grid lines and bars */}
        <div className="relative w-full flex items-end justify-around px-2 sm:px-8 min-w-[280px]">
          {chartData.map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-1 sm:gap-2">
              {/* Bar */}
              <div className="flex flex-col items-center">
                <div
                  className="w-8 sm:w-12 bg-gradient-to-b from-[#e8f1ff] to-[#2c7be5] rounded-lg transition-all hover:opacity-80"
                  style={{
                    height: `${(item.value / maxValue) * 100}px`,
                  }}
                />
                {/* Value label */}
                <div className="mt-1 sm:mt-2 bg-[#2c7be5] text-white text-[8px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-poppins">
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-around px-2 sm:px-8 text-[8px] sm:text-[10px] font-semibold text-[#637381] font-poppins overflow-x-auto min-w-[280px]">
        {chartData.map((item, index) => (
          <span key={index} className="whitespace-nowrap">{item.label}</span>
        ))}
      </div>
    </div>
  );
}
