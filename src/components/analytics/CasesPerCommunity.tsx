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
    { label: '5', value: 60 },
  ];

  const chartData = data || defaultData;
  const maxValue = Math.max(...chartData.map((d) => d.value));
  const minValue = Math.min(...chartData.map((d) => d.value));

  // Calculate points for the line chart
  const chartWidth = 100;
  const chartHeight = 150;
  const padding = 10;
  const pointSpacing = (chartWidth - padding * 2) / (chartData.length - 1);

  const getY = (value: number) => {
    const range = maxValue - minValue || 1;
    return chartHeight - padding - ((value - minValue) / range) * (chartHeight - padding * 2);
  };

  const points = chartData.map((item, index) => ({
    x: padding + index * pointSpacing,
    y: getY(item.value),
    value: item.value,
  }));

  // Create line path
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Create area path (for gradient fill under line)
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding} L ${padding} ${chartHeight - padding} Z`;

  return (
    <div className="bg-white border border-[#d9d9d9] rounded-[8px] p-4 sm:p-6 flex flex-col min-h-[280px]">
      {/* Title */}
      <div className="mb-4">
        <h3 className="text-[16px] sm:text-[18px] font-semibold text-[#212b36] font-poppins">Cases Per Community</h3>
        <p className="text-[10px] text-[#b1b9c0] font-poppins mt-1">Number Of Test Carried On Every Visit</p>
      </div>

      {/* Line Chart */}
      <div className="flex-1 relative">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 20}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          {/* Gradient definition */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2c7be5" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#2c7be5" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Y-axis line */}
          <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke="#e5e7eb" strokeWidth="1" />

          {/* X-axis line */}
          <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#e5e7eb" strokeWidth="1" />

          {/* Area fill */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Line */}
          <path d={linePath} fill="none" stroke="#2c7be5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Points and labels */}
          {points.map((point, index) => (
            <g key={index}>
              {/* Point circle */}
              <circle cx={point.x} cy={point.y} r="4" fill="#2c7be5" stroke="white" strokeWidth="2" />
              
              {/* Value label */}
              <rect x={point.x - 12} y={point.y - 22} width="24" height="16" rx="8" fill="#2c7be5" />
              <text x={point.x} y={point.y - 11} textAnchor="middle" fill="white" fontSize="8" fontWeight="600">
                {point.value}
              </text>

              {/* X-axis label */}
              <text x={point.x} y={chartHeight + 10} textAnchor="middle" fill="#637381" fontSize="10" fontWeight="500">
                {chartData[index].label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
