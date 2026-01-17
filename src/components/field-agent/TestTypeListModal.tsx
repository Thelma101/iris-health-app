'use client';

import React, { useState } from 'react';

interface TestType {
  id: string;
  name: string;
  results: string[];
}

interface TestTypeListModalProps {
  isOpen: boolean;
  onClose: () => void;
  testTypes: TestType[];
  onEdit: (testType: TestType) => void;
  onDelete: (testTypeId: string) => void;
  onCreateNew: () => void;
}

const TestTypeListModal: React.FC<TestTypeListModalProps> = ({
  isOpen,
  onClose,
  testTypes,
  onEdit,
  onDelete,
  onCreateNew,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#f5f5f5] backdrop-blur-[10px] opacity-80"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-[10px] w-[625px] max-h-[80vh] shadow-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="h-12 bg-white border-b border-[#d9d9d9] flex items-center justify-between px-[22px] flex-shrink-0">
          <p className="font-poppins font-medium text-xl text-[#212b36]">
            Test Types
          </p>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="#212B36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Create New Button */}
          <button
            onClick={onCreateNew}
            className="mb-6 flex items-center gap-2 px-4 py-2 bg-[#2c7be5] rounded-[10px] text-white font-poppins font-medium text-sm hover:bg-blue-600 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Create New Test Type
          </button>

          {/* Test Type List */}
          <div className="flex flex-col gap-4">
            {testTypes.map((testType) => (
              <div
                key={testType.id}
                className="border border-[#d9d9d9] rounded-[10px] overflow-hidden"
              >
                {/* Test Type Header */}
                <div
                  className="h-12 bg-[#2c7be5] flex items-center justify-between px-4 cursor-pointer"
                  onClick={() => toggleExpanded(testType.id)}
                >
                  <span className="font-poppins font-medium text-base text-white">
                    {testType.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(testType);
                      }}
                      className="p-1 hover:bg-white/20 rounded"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(testType.id);
                      }}
                      className="p-1 hover:bg-white/20 rounded"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6H5H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`transform transition-transform ${expandedId === testType.id ? 'rotate-180' : ''}`}
                    >
                      <path d="M6 9L12 15L18 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Expected Results (Expanded) */}
                {expandedId === testType.id && (
                  <div className="p-4 bg-white">
                    <p className="font-poppins font-medium text-sm text-[#637381] mb-3">
                      Expected Results:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {testType.results.map((result, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-[#ecf4ff] rounded-full font-poppins text-sm text-[#2c7be5]"
                        >
                          {result}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {testTypes.length === 0 && (
              <div className="text-center py-8">
                <p className="font-poppins text-[#637381]">No test types found</p>
                <p className="font-poppins text-sm text-[#9da9b4] mt-1">
                  Click &quot;Create New Test Type&quot; to add one
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestTypeListModal;
