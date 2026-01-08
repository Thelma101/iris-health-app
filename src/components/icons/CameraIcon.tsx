import React from 'react';

export default function CameraIcon({ className = "size-6" }: { readonly className?: string }) {
  return (
    <div className={`${className} relative`}>
      <div className="w-5 h-4 left-[2px] top-[3.50px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-gray-500" />
      <div className="size-2 left-[8px] top-[9px] absolute outline outline-[1.50px] outline-offset-[-0.75px] outline-gray-500" />
      <div className="w-0 h-[0.01px] left-[19px] top-[9.50px] absolute outline outline-2 outline-offset-[-1px] outline-gray-500" />
    </div>
  );
}
