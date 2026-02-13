'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api/index';

interface ChartItem {
  label: string;
  value: number;
  color: string;
}

interface RatePerTypeProps {
  data?: ChartItem[];
  loading?: boolean;
}

export default function RatePerType({ data, loading: externalLoading }: RatePerTypeProps) {
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [internalLoading, setInternalLoading] = useState(false);

  const defaultColors = ['#3B82F6', '#F97316', '#10B981', '#8B5CF6', '#EF4444', '#F59E0B', '#06B6D4', '#EC4899'];

  useEffect(() => {
    if (data !== undefined) {
      setChartData(data);
      return;
    }

    setInternalLoading(true);
    api.getTestRatePerType()
      .then((res) => {
        if (res?.success && res.data) {
          const dist = (res.data as any).distribution || [];
          if (dist.length > 0) {
            setChartData(dist.slice(0, 6).map((d: any, i: number) => ({
              label: d.type,
              value: d.percentage,
              color: defaultColors[i % defaultColors.length],
            })));
          } else {
            setChartData([
              { label: 'Positive', value: (res.data as any).positivePercentage || 0, color: '#10B981' },
              { label: 'Negative', value: (res.data as any).negativePercentage || 0, color: '#3B82F6' },
            ]);
          }
        }
      })
      .catch((err) => console.error('Error fetching test rate:', err))
      .finally(() => setInternalLoading(false));
  }, [data]);

  const loading = externalLoading !== undefined ? externalLoading : internalLoading;
  const hasData = chartData.some(d => d.value > 0);

  // SVG donut chart
  const size = 180;
  const center = size / 2;
  const outerRadius = size / 2;
  const innerRadius = size / 3.2; // donut hole

  const getDonutPath = (startAngle: number, endAngle: number, outer: number, inner: number) => {
    const toRad = (a: number) => ((a - 90) * Math.PI) / 180;
    const x1 = center + outer * Math.cos(toRad(startAngle));
    const y1 = center + outer * Math.sin(toRad(startAngle));
    const x2 = center + outer * Math.cos(toRad(endAngle));
    const y2 = center + outer * Math.sin(toRad(endAngle));
    const x3 = center + inner * Math.cos(toRad(endAngle));
    const y3 = center + inner * Math.sin(toRad(endAngle));
    const x4 = center + inner * Math.cos(toRad(startAngle));
    const y4 = center + inner * Math.sin(toRad(startAngle));
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${outer} ${outer} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${inner} ${inner} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  };

  // Build slices
  let currentAngle = 0;
  const slices = chartData.filter(d => d.value > 0).map((item) => {
    const angle = (item.value / 100) * 360;
    const slice = { ...item, startAngle: currentAngle, endAngle: currentAngle + Math.max(angle, 1) };
    currentAngle += angle;
    return slice;
  });

  return (
    <div className="bg-white border border-[#d9d9d9] rounded-lg min-h-[280px] sm:min-h-[334px] overflow-hidden w-full p-4 sm:p-6">
      <p className="text-[18px] sm:text-[20px] font-semibold text-[#212b36] font-poppins mb-4 sm:mb-6">
        Tests by Type
      </p>
      {loading ? (
        <div className="flex items-center justify-center h-[200px] text-[#637381] font-poppins">Loading...</div>
      ) : !hasData ? (
        <div className="flex items-center justify-center h-[200px] text-[#637381] font-poppins">No test data available</div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-[30px] items-center justify-center">
          {/* Donut Chart */}
          <div className="w-[140px] h-[140px] sm:w-[180px] sm:h-[180px] shrink-0">
            <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
              {slices.map((s, i) => (
                <path key={i} d={getDonutPath(s.startAngle, s.endAngle, outerRadius, innerRadius)} fill={s.color} />
              ))}
              {/* Center text */}
              <text x={center} y={center - 5} textAnchor="middle" className="text-xs fill-[#637381]" fontSize="11">Total</text>
              <text x={center} y={center + 12} textAnchor="middle" className="text-sm font-bold fill-[#212b36]" fontSize="14">
                {chartData.reduce((s, d) => s + d.value, 0)}%
              </text>
            </svg>
          </div>
          {/* Legend */}
          <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto">
            {chartData.filter(d => d.value > 0).map((item, i) => (
              <div key={i} className="flex gap-2 sm:gap-3 items-center">
                <div className="h-[12px] w-[12px] rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                <p className="text-[11px] sm:text-[13px] text-[#637381] font-poppins truncate max-w-[100px]">
                  {item.label}
                </p>
                <p className="text-[11px] sm:text-[13px] font-semibold text-[#637381] font-poppins">
                  {item.value}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
