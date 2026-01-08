import React from "react";
import Image from "next/image";

type Props = Readonly<{ className?: string }>;

export default function Logo({ className }: Props) {
  return (
    <Image
      src="/logo.svg"
      alt="MedTrack"
      width={24}
      height={20}
      className={className}
      priority
    />
  );
}
