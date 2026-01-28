'use client';

import { TEST_RESULT_OPTIONS } from '@/lib/constants/test-options';

interface TestResultModalProps {
  isOpen: boolean;
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}

export default function TestResultModal({ isOpen, selectedValue, onSelect, onClose }: TestResultModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed right-0 top-[65px] h-[calc(100vh-65px)] w-80 bg-white rounded-lg shadow-2xl z-50 overflow-y-auto border border-[#d9d9d9]">
        {/* Search Header */}
        <div className="sticky top-0 bg-white p-4 border-b border-[#d9d9d9]">
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-[#f4f5f7] border border-[#d9d9d9]">
            <svg className="w-5 h-5 text-[#637381] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search here"
              className="bg-transparent text-sm font-poppins text-[#637381] placeholder:text-[#d9d9d9] focus:outline-none w-full"
            />
          </div>
        </div>

        {/* Options List */}
        <div className="divide-y divide-[#e5e7eb]">
          {TEST_RESULT_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => {
                onSelect(option);
                onClose();
              }}
              className={`w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left ${
                selectedValue === option ? 'bg-[#ecf4ff]' : ''
              }`}
            >
              <span className={`font-poppins text-sm ${selectedValue === option ? 'text-[#2c7be5] font-medium' : 'text-[#637381]'}`}>
                {option}
              </span>
              {selectedValue === option && (
                <div className="w-5 h-5 rounded-full bg-[#2c7be5] flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
