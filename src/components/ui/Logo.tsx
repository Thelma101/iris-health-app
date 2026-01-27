import React from "react";
import Image from "next/image";

type Props = Readonly<{ className?: string; size?: 'sm' | 'md' | 'lg' }>;

export default function Logo({ className, size = 'md' }: Props) {
  const sizes = {
    sm: { width: 140, height: 28 },
    md: { width: 180, height: 35 },
    lg: { width: 224, height: 35 },
  };

  const { width, height } = sizes[size];

  return (
    <Image
      src="/images/logo.svg"
      alt="MedTrack"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
