import React from "react";
import Image from "next/image";

type StatCardProps = {
  readonly title: string;
  readonly value: string | number;
  readonly subtitle: string;
  readonly progress?: number;
  readonly progressColour: string;
  readonly cardBg: string;
  readonly iconSrc?: string;
};

export default function StatCard({
  title,
  value,
  subtitle,
  progress = 0,
  progressColour,
  cardBg,
  iconSrc,
}: StatCardProps) { 
  return (
    <div className={`w-full min-w-[318px] px-5 py-3 rounded-[10px] flex flex-col justify-start items-start gap-4 ${cardBg} overflow-hidden`}>
      {/* Title */}
      <p className="self-stretch text-[#212b36] text-base font-medium font-poppins leading-normal">
        {title}
      </p>

      {/* Value and Icon row */}
      <div className="self-stretch flex justify-between items-center gap-[88px]">
        <div className="flex flex-col justify-start items-start w-[145px] sm:w-[261px]">
          <p className="text-[#212b36] text-[32px] font-semibold font-poppins leading-none min-w-full">
            {value}
          </p>
          <p className="text-[#637381] text-xs font-normal font-poppins leading-tight mt-1 w-full">
            {subtitle}
          </p>
        </div>

        {/* Icon Container */}
        <div className="w-[45px] h-[45px] relative bg-white rounded-[30px] overflow-hidden shrink-0">
          {iconSrc ? (
            <Image
              src={iconSrc}
              alt=""
              width={29}
              height={29}
              className="absolute left-[8px] top-1/2 -translate-y-1/2 object-cover"
            />
          ) : (
            <div className="w-[29px] h-[29px] bg-gray-200 absolute left-[8px] top-1/2 -translate-y-1/2" />
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="self-stretch h-3.5 relative bg-white rounded-lg overflow-hidden shrink-0">
        <div 
          className={`h-3.5 left-0 top-0 absolute ${progressColour} transition-all duration-300`} 
          style={{ width: `${Math.min(Math.round(progress * 100), 100)}%` }} 
        />
      </div>
    </div>
  );
}
