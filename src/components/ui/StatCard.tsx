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
  readonly fullWidth?: boolean;
};

export default function StatCard({
  title,
  value,
  subtitle,
  progress = 0,
  progressColour,
  cardBg,
  iconSrc,
  fullWidth = false,
}: StatCardProps) { 
  return (
    <div className={`${fullWidth ? 'w-full' : 'w-full'} px-4 sm:px-5 py-3 rounded-[10px] flex flex-col justify-start items-start gap-3 sm:gap-4 ${cardBg} overflow-hidden`}>
      {/* Title */}
      <div className="self-stretch text-gray-800 text-sm sm:text-base font-medium font-poppins">
        {title}
      </div>

      {/* Value and Icon row */}
      <div className="self-stretch flex justify-between items-start gap-3 sm:gap-[88px]">
        <div className={`flex flex-col justify-start items-start`}>
          <div className="text-gray-800 text-2xl sm:text-4xl font-semibold font-poppins leading-none">
            {value}
          </div>
          <div className="text-gray-500 text-xs font-normal font-poppins leading-tight mt-1">
            {subtitle}
          </div>
        </div>

        {/* Icon */}
        <div className="w-[40px] sm:w-[45px] h-[40px] sm:h-[45px] relative bg-white rounded-[30px] overflow-hidden shrink-0 flex-shrink-0">
          {iconSrc ? (
            <Image
              src={iconSrc}
              alt=""
              width={29}
              height={29}
              className="absolute left-[8px] top-1/2 -translate-y-1/2 object-cover"
            />
          ) : (
            <div className="w-7 h-7 bg-gray-200 absolute left-[8px] top-1/2 -translate-y-1/2" />
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="self-stretch h-3 sm:h-3.5 relative bg-white rounded-lg overflow-hidden shrink-0">
        <div className={`h-3 sm:h-3.5 left-0 top-0 absolute ${progressColour}`} style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
    </div>
  );
}
