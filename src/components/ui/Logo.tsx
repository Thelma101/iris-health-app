import React from "react";
import Image from "next/image";

type Props = Readonly<{ className?: string }>;

export default function Logo({ className }: Props) {
  return (
    <Image
      src="/logo.svg"
      alt="MedTrack"
      width={224}
      height={34}
      className={className}
      priority
    />
  );
}
