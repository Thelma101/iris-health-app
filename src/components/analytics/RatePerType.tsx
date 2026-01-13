'use client';

import React from 'react';

interface RatePerTypeProps {
  positivePercentage?: number;
  negativePercentage?: number;
}

export default function RatePerType({ positivePercentage = 40, negativePercentage = 60 }: RatePerTypeProps) {
  // SVG pie chart calculations
  const size = 217;
  const center = size / 2;
  const radius = size / 2;

  // Calculate pie slice paths
  const getSlicePath = (startAngle: number, endAngle: number) => {
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  // Calculate angles
  const negativeAngle = (negativePercentage / 100) * 360;
  const positiveAngle = (positivePercentage / 100) * 360;

  return (
    <div className="bg-white border border-[#d9d9d9] rounded-lg p-4 sm:p-6 flex flex-col min-h-[280px]">
      {/* Title */}
      <h3 className="text-[16px] sm:text-[18px] font-semibold text-[#212b36] font-poppins mb-4">Rate Per Type</h3>

      {/* Chart Content */}
      <div className="flex flex-col sm:flex-row items-center justify-center flex-1 gap-6 sm:gap-[45px]">
        {/* Pie Chart SVG */}
        <div className="flex items-center justify-center flex-shrink-0">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Negative (Blue) slice - starts at 0 */}
            <path
              d={getSlicePath(0, negativeAngle)}
              fill="#2c7be5"
            />

            {/* Positive (Green) slice - starts after negative */}
            <path
              d={getSlicePath(negativeAngle, negativeAngle + positiveAngle)}
              fill="#00c897"
            />
          </svg>
        </div>

        {/* Legend */}
        <div className="w-[151px] flex flex-col gap-3">
          {/* Positive */}
          <div className="flex items-center gap-3.5">
            <span className="text-[14px] font-semibold uppercase text-[#637381] font-poppins">Positive</span>
            <div className="w-[31px] h-[13px] bg-[#00c897] rounded" />
            <span className="text-[14px] font-semibold uppercase text-[#637381] font-poppins">{positivePercentage}%</span>
          </div>

          {/* Negative */}
          <div className="flex items-center gap-3.5">
            <span className="text-[14px] font-semibold uppercase text-[#637381] font-poppins shrink-0">Negative</span>
            <div className="w-[31px] h-[13px] bg-[#2c7be5] rounded shrink-0" />
            <span className="text-[14px] font-semibold uppercase text-[#637381] font-poppins shrink-0">{negativePercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
