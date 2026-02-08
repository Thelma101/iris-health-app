'use client';

import React from 'react';

interface TestType {
  _id: string;
  id?: string;
  name: string;
  results: string[];
}

interface TestTypeListModalProps {
  isOpen: boolean;
  onClose: () => void;
  testTypes: TestType[];
  onEdit?: (testType: TestType) => void;
  onDelete?: (testTypeId: string) => void;
  onCreateNew?: () => void;
  isReadOnly?: boolean;
}

const TestTypeListModal: React.FC<TestTypeListModalProps> = ({
  isOpen,
  onClose,
  testTypes,
  onEdit,
  onDelete,
  isReadOnly = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-start justify-center sm:justify-end">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/20 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-[554px] h-screen sm:max-h-screen rounded-none sm:rounded-bl-[10px] bg-white overflow-hidden shadow-[0px_12px_35px_rgba(0,0,0,0.18)] flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-[#d9d9d9] h-12 flex items-center justify-between px-[22px] flex-shrink-0">
          <div className="font-medium text-xl text-[#212b36] font-poppins">Test Type List</div>
          <button onClick={onClose} className="cursor-pointer hover:opacity-70 transition-opacity">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-[17px]">
          {testTypes.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-[#637381] text-sm font-poppins">No test types available at this time.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-[30px]">
              {testTypes.map((testType) => (
                <div
                  key={testType._id}
                  className="border-b border-[#d9d9d9] pb-2 flex flex-col gap-[13px]"
                >
                  {/* Blue header bar */}
                  <div className="h-6 bg-[#2c7be5] px-1 flex items-center">
                    <span className="flex-1 font-medium text-white text-[16px] font-poppins leading-normal">
                      {testType.name}
                    </span>
                  </div>

                  {/* Results list */}
                  <div className="flex flex-col gap-[10px]">
                    {testType.results.map((result) => (
                      <p
                        key={result}
                        className="text-sm text-[#637381] font-poppins leading-normal"
                      >
                        {result}
                      </p>
                    ))}
                  </div>

                  {/* Edit / Delete icons at bottom (hidden for read-only) */}
                  {!isReadOnly && (
                    <div className="flex items-center justify-between h-6">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(testType)}
                          className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity cursor-pointer"
                          aria-label="Edit test type"
                        >
                          <svg className="w-5 h-5 text-[#637381]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(testType._id)}
                          className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity cursor-pointer"
                          aria-label="Delete test type"
                        >
                          <svg className="w-5 h-5 text-[#637381]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestTypeListModal;
