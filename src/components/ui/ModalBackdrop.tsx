import React from 'react';

interface ModalBackdropProps {
  onClick?: () => void;
  className?: string;
}

export default function ModalBackdrop({ onClick, className = '' }: ModalBackdropProps) {
  return (
    <div
      className={`fixed inset-0 z-40 bg-white/30 backdrop-blur-sm cursor-pointer ${className}`}
      onClick={onClick}
    />
  );
}
