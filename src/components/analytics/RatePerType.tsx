'use client';

import React from 'react';

interface RatePerTypeProps {
  positivePercentage?: number;
  negativePercentage?: number;
}

export default function RatePerType({ positivePercentage = 40, negativePercentage = 60 }: RatePerTypeProps) {
  // SVG pie chart
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const positiveOffset = (circumference * (100 - positivePercentage)) / 100;
  const negativeOffset = 0;

  return (
    <div className="bg-white border border-[#d9d9d9] rounded-[8px] p-7 flex flex-col h-[334px]">
      {/* Title */}
      <h3 className="text-[18px] font-semibold text-[#212b36] font-poppins mb-8">Rate Per Type</h3>

      {/* Chart Content */}
      <div className="flex items-center justify-between flex-1 gap-12">
        {/* Pie Chart SVG */}
        <div className="flex items-center justify-center">
          <svg width="220" height="220" viewBox="0 0 220 220" className="transform">
            {/* Background circle */}
            <circle cx="110" cy="110" r="90" fill="none" stroke="#e8f1ff" strokeWidth="40" />

            {/* Negative (Blue) segment - 60% */}
            <circle
              cx="110"
              cy="110"
              r="90"
              fill="none"
              stroke="#2c7be5"
              strokeWidth="40"
              strokeDasharray={circumference}
              strokeDashoffset={positiveOffset}
              transform="rotate(-90 110 110)"
            />

            {/* Positive (Green) segment - 40% */}
            <circle
              cx="110"
              cy="110"
              r="90"
              fill="none"
              stroke="#00c897"
              strokeWidth="40"
              strokeDasharray={circumference * (positivePercentage / 100)}
              strokeDashoffset={negativeOffset}
              transform={`rotate(${(360 * (100 - positivePercentage)) / 100 - 90} 110 110)`}
            />
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3">
          {/* Positive */}
          <div className="flex items-center gap-[14px]">
            <span className="text-[14px] font-semibold uppercase text-[#637381] font-poppins">Positive</span>
            <div className="w-[31px] h-[13px] bg-[#00c897] rounded-[4px]" />
            <span className="text-[14px] font-semibold uppercase text-[#637381] font-poppins">{positivePercentage}%</span>
          </div>

          {/* Negative */}
          <div className="flex items-center gap-[14px]">
            <span className="text-[14px] font-semibold uppercase text-[#637381] font-poppins">Negative</span>
            <div className="w-[31px] h-[13px] bg-[#2c7be5] rounded-[4px]" />
            <span className="text-[14px] font-semibold uppercase text-[#637381] font-poppins">{negativePercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
