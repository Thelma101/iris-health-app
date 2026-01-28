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
    <div className={`w-full px-4 sm:px-5 py-3 rounded-[10px] flex flex-col justify-start items-start gap-3 sm:gap-4 ${cardBg} overflow-hidden`}>
      <p className="self-stretch text-[#212b36] text-sm sm:text-base font-medium font-poppins leading-normal">
        {title}
      </p>

      <div className="self-stretch flex justify-between items-center gap-4">
        <div className="flex flex-col justify-start items-start flex-1 min-w-0">
          <p className="text-[#212b36] text-2xl sm:text-[32px] font-semibold font-poppins leading-none">
            {value}
          </p>
          <p className="text-[#637381] text-[10px] sm:text-xs font-normal font-poppins leading-tight mt-1">
            {subtitle}
          </p>
        </div>

        <div className="w-10 h-10 sm:w-[45px] sm:h-[45px] relative bg-white rounded-full overflow-hidden shrink-0 flex items-center justify-center">
          {iconSrc ? (
            <Image
              src={iconSrc}
              alt=""
              width={29}
              height={29}
              className="object-cover w-6 h-6 sm:w-[29px] sm:h-[29px]"
            />
          ) : (
            <div className="w-6 h-6 sm:w-[29px] sm:h-[29px] bg-gray-200 rounded" />
          )}
        </div>
      </div>

      <div className="self-stretch h-3 sm:h-3.5 relative bg-white rounded-lg overflow-hidden shrink-0">
        <div
          className={`h-full absolute left-0 top-0 ${progressColour} transition-all duration-300 rounded-lg`}
          style={{ width: `${Math.min(Math.round(progress * 100), 100)}%` }}
        />
      </div>
    </div>
  );
}
