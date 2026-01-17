'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api/index';

export default function RatePerType() {
  const [positivePercentage, setPositivePercentage] = useState<number>(0);
  const [negativePercentage, setNegativePercentage] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getTestRatePerType()
      .then((res) => {
        if (
          res?.success &&
          res.data &&
          typeof res.data === 'object' &&
          'positivePercentage' in res.data &&
          'negativePercentage' in res.data
        ) {
          const pos = (res.data as { positivePercentage: number }).positivePercentage;
          const neg = (res.data as { negativePercentage: number }).negativePercentage;
          setPositivePercentage(pos);
          setNegativePercentage(neg);
          setHasData(pos > 0 || neg > 0);
        } else {
          setHasData(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching test rate:', err);
        setHasData(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // SVG pie chart calculations
  const size = 180;
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

  const negativeAngle = (negativePercentage / 100) * 360;
  const positiveAngle = (positivePercentage / 100) * 360;

  return (
    <div className="bg-white border border-[#d9d9d9] rounded-lg h-[280px] sm:h-[334px] overflow-hidden w-full p-4 sm:p-6">
      <p className="text-[16px] sm:text-[18px] font-semibold text-[#212b36] font-poppins capitalize mb-4 sm:mb-6">
        Rate Per Type
      </p>
      {loading ? (
        <div className="flex items-center justify-center h-[200px] text-[#637381] font-poppins">Loading...</div>
      ) : !hasData ? (
        <div className="flex items-center justify-center h-[200px] text-[#637381] font-poppins">No test data available</div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-[45px] items-center justify-center">
          {/* Pie Chart */}
          <div className="w-[140px] h-[140px] sm:w-[180px] sm:h-[180px] shrink-0">
            <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
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
          <div className="flex flex-col gap-3">
            {/* Positive */}
            <div className="flex gap-2.5 sm:gap-3.5 items-center">
              <p className="text-[12px] sm:text-[14px] font-semibold uppercase text-[#637381] font-poppins w-[60px] sm:w-[70px]">
                Positive
              </p>
              <div className="bg-[#00c897] h-[13px] rounded-sm w-[25px] sm:w-[31px]" />
              <p className="text-[12px] sm:text-[14px] font-semibold uppercase text-[#637381] font-poppins">
                {positivePercentage}%
              </p>
            </div>
            {/* Negative */}
            <div className="flex gap-2.5 sm:gap-3.5 items-center">
              <p className="text-[12px] sm:text-[14px] font-semibold uppercase text-[#637381] font-poppins w-[60px] sm:w-[70px]">
                Negative
              </p>
              <div className="bg-[#2c7be5] h-[13px] rounded-sm w-[25px] sm:w-[31px]" />
              <p className="text-[12px] sm:text-[14px] font-semibold uppercase text-[#637381] font-poppins">
                {negativePercentage}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
