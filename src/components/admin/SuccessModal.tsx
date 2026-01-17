'use client';
import React from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export default function SuccessModal({ isOpen, onClose, title = 'Success!', message }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm cursor-pointer" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-[400px] rounded-[10px] bg-white overflow-hidden shadow-lg mx-4 p-6">
        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-[#e8f1ff] flex items-center justify-center">
            <svg className="w-8 h-8 text-[#2c7be5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-[#212b36] text-center font-poppins mb-2">
          {title}
        </h2>

        {/* Message */}
        <p className="text-sm text-[#637381] text-center font-poppins mb-6">
          {message}
        </p>

        {/* Button */}
        <button
          onClick={onClose}
          className="w-full h-12 rounded-[10px] bg-[#2c7be5] text-white font-medium font-inter hover:bg-[#1e5aa8] transition-colors cursor-pointer"
        >
          OK
        </button>
      </div>
    </div>
  );
}


