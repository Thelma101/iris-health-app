import React from "react";
import Image from "next/image";

type Props = Readonly<{ className?: string; size?: 'sm' | 'md' | 'lg' }>;

export default function Logo({ className, size = 'md' }: Props) {
  const sizes = {
    sm: { iconW: 18, iconH: 20, textW: 116, textH: 18, gap: 'gap-2' },
    md: { iconW: 20, iconH: 22, textW: 130, textH: 20, gap: 'gap-2.5' },
    lg: { iconW: 24, iconH: 26, textW: 154, textH: 24, gap: 'gap-[11px]' },
  };

  const { iconW, iconH, textW, textH, gap } = sizes[size];

  return (
    <div className={`flex items-center ${gap} ${className || ''}`}>
      <Image
        src="/images/medtrack-icon.svg"
        alt="MedTrack Icon"
        width={iconW}
        height={iconH}
        priority
      />
      <Image
        src="/images/medtrack-text.svg"
        alt="MedTrack"
        width={textW}
        height={textH}
        priority
      />
    </div>
  );
}
