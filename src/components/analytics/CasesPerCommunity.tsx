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
    { label: '2', value: 18 },
    { label: '3', value: 21 },
    { label: '4', value: 21 },
    { label: '5', value: 50 },
  ];

  const chartData = data || defaultData;
  const maxValue = Math.max(...chartData.map((d) => d.value));
  const minValue = Math.min(...chartData.map((d) => d.value));

  // Chart dimensions - responsive
  const getY = (value: number, height: number) => {
    const range = maxValue - minValue || 1;
    const padding = 20;
    return height - padding - ((value - minValue) / range) * (height - padding * 2);
  };

  return (
    <div
      className="h-[280px] sm:h-[334px] overflow-hidden rounded-[8px] w-full p-4 sm:p-6"
      style={{
        backgroundImage: 'linear-gradient(118.89deg, rgba(255, 249, 230, 0.29) 3.64%, rgba(232, 241, 255, 0.29) 100.8%)',
      }}
    >
      {/* Title */}
      <div className="flex flex-col gap-[5px] mb-4 sm:mb-6">
        <p className="text-[16px] sm:text-[18px] font-semibold text-[#212b36] font-poppins capitalize">
          Cases Per Community
        </p>
        <p className="text-[10px] text-[#b1b9c0] font-poppins capitalize">
          Number of test carried on every visit
        </p>
      </div>

      {/* Chart Container */}
      <div className="w-full h-[180px] sm:h-[220px]">
        <svg viewBox="0 0 500 200" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          {/* Gradient definition */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E8F1FF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#E8F1FF" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Y-axis */}
          <line x1="40" y1="20" x2="40" y2="160" stroke="#d9d9d9" strokeWidth="2" />
          
          {/* X-axis */}
          <line x1="40" y1="160" x2="460" y2="160" stroke="#d9d9d9" strokeWidth="2" />

          {/* Grid lines */}
          <line x1="40" y1="50" x2="460" y2="50" stroke="#f4f5f7" strokeWidth="1" />
          <line x1="40" y1="80" x2="460" y2="80" stroke="#f4f5f7" strokeWidth="1" />
          <line x1="40" y1="110" x2="460" y2="110" stroke="#f4f5f7" strokeWidth="1" />
          <line x1="40" y1="140" x2="460" y2="140" stroke="#f4f5f7" strokeWidth="1" />

          {/* Area fill under line */}
          <path
            d={`M 60 ${getY(chartData[0].value, 180)} 
                L 160 ${getY(chartData[1].value, 180)} 
                L 260 ${getY(chartData[2].value, 180)} 
                L 360 ${getY(chartData[3].value, 180)} 
                L 460 ${getY(chartData[4].value, 180)} 
                L 460 160 L 60 160 Z`}
            fill="url(#chartGradient)"
          />

          {/* Line */}
          <path
            d={`M 60 ${getY(chartData[0].value, 180)} 
                L 160 ${getY(chartData[1].value, 180)} 
                L 260 ${getY(chartData[2].value, 180)} 
                L 360 ${getY(chartData[3].value, 180)} 
                L 460 ${getY(chartData[4].value, 180)}`}
            fill="none"
            stroke="#2C7BE5"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points and value badges */}
          {chartData.map((item, index) => {
            const x = 60 + index * 100;
            const y = getY(item.value, 180);
            return (
              <g key={index}>
                {/* Circle point */}
                <circle cx={x} cy={y} r="6" fill="#2C7BE5" />
                
                {/* Value badge */}
                <rect x={x - 15} y={y + 10} width="30" height="20" rx="10" fill="#2c7be5" />
                <text x={x} y={y + 24} textAnchor="middle" fill="white" fontSize="10" fontWeight="600" fontFamily="Poppins">
                  {item.value}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {chartData.map((item, index) => {
            const x = 60 + index * 100;
            return (
              <text key={index} x={x} y="180" textAnchor="middle" fill="#637381" fontSize="12" fontWeight="600" fontFamily="Poppins">
                {item.label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
