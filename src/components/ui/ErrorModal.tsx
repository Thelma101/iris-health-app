'use client';
import React from 'react';

interface ErrorModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    onRetry?: () => void;
}

export default function ErrorModal({
    isOpen,
    onClose,
    title = 'Error',
    message,
    onRetry
}: ErrorModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm cursor-pointer"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-[400px] rounded-[10px] bg-white overflow-hidden shadow-lg mx-4 p-6">
                {/* Error Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

                {/* Buttons */}
                <div className="flex gap-3">
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="flex-1 h-12 rounded-[10px] bg-white border border-[#d9d9d9] text-[#637381] font-medium font-inter hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            Retry
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className={`${onRetry ? 'flex-1' : 'w-full'} h-12 rounded-[10px] bg-[#2c7be5] text-white font-medium font-inter hover:bg-[#1e5aa8] transition-colors cursor-pointer`}
                    >
                        {onRetry ? 'Close' : 'OK'}
                    </button>
                </div>
            </div>
        </div>
    );
}
