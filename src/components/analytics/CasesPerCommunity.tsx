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
    { label: '1', value: 78 },
    { label: '2', value: 21 },
    { label: '3', value: 18 },
    { label: '4', value: 21 },
    { label: '5', value: 50 },
  ];

  const chartData = data || defaultData;
  const maxValue = Math.max(...chartData.map((d) => d.value));

  return (
    <div
      className="bg-white border border-[#d9d9d9] rounded-[8px] p-7 flex flex-col"
      style={{
        backgroundImage: 'linear-gradient(118.89deg, rgba(255, 249, 230, 0.29) 3.64%, rgba(232, 241, 255, 0.29) 100.8%)',
      }}
    >
      {/* Title */}
      <div className="mb-6">
        <h3 className="text-[18px] font-semibold text-[#212b36] font-poppins">Cases Per Community</h3>
        <p className="text-[10px] text-[#b1b9c0] font-poppins mt-1">Number of test carried on every visit</p>
      </div>

      {/* Chart Area */}
      <div className="flex-1 flex items-end justify-center gap-12 relative mb-8 h-64">
        {/* Y-axis line */}
        <div className="absolute left-8 top-0 bottom-0 w-[2px] bg-[#d9d9d9]" />

        {/* Grid lines and bars */}
        <div className="relative w-full flex items-end justify-around px-8">
          {chartData.map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              {/* Bar */}
              <div className="flex flex-col items-center">
                <div
                  className="w-12 bg-gradient-to-b from-[#e8f1ff] to-[#2c7be5] rounded-lg transition-all hover:opacity-80"
                  style={{
                    height: `${(item.value / maxValue) * 120}px`,
                  }}
                />
                {/* Value label */}
                <div className="mt-2 bg-[#2c7be5] text-white text-[10px] font-semibold px-2 py-1 rounded-full font-poppins">
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-around px-8 text-[10px] font-semibold text-[#637381] font-poppins">
        {chartData.map((item, index) => (
          <span key={index}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}
