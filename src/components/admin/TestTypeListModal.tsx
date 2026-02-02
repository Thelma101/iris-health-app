'use client';
import { useState } from 'react';
import ConfirmModal from './ConfirmModal';

interface TestType {
  id: number;
  name: string;
  results: string[];
}

interface TestTypeListModalProps {
  isOpen: boolean;
  onClose: () => void;
  testTypes: TestType[];
  onEdit?: (testType: TestType) => void;
  onDelete?: (id: number) => void;
}

export default function TestTypeListModal({ isOpen, onClose, testTypes, onEdit, onDelete }: Readonly<TestTypeListModalProps>) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [testTypeToDelete, setTestTypeToDelete] = useState<TestType | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-start justify-center sm:justify-end px-0">
      {/* Backdrop */}
      <button 
        type="button"
        className="absolute inset-0 bg-black/20 backdrop-blur-sm cursor-pointer" 
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        aria-label="Close modal"
      />
      
      {/* Modal */}
      <div className="relative w-full sm:max-w-[554px] max-h-[90vh] sm:max-h-screen rounded-none sm:rounded-t-none sm:rounded-bl-[10px] bg-white overflow-hidden shadow-[0px_12px_35px_rgba(0,0,0,0.18)] mt-0 mr-0 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-[#d9d9d9] h-12 flex items-center justify-between px-[22px]">
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
              <p className="text-[#637381] text-sm font-poppins">No test types found. Create one to get started.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {testTypes.map((testType) => (
                <div
                  key={testType.id}
                  className="rounded-[10px] border border-[#d9d9d9] overflow-hidden shadow-[0px_4px_16px_rgba(0,0,0,0.06)]"
                >
                  {/* Row header with actions inline per Figma */}
                  <div className="h-10 bg-[#2c7be5] px-4 flex items-center gap-3">
                    <div className="flex-1 font-medium text-white text-[16px] font-poppins leading-none">
                      {testType.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit?.(testType)}
                        className="w-8 h-8 rounded-full bg-white/15 border border-white/30 flex items-center justify-center hover:bg-white/25 transition-colors cursor-pointer"
                        aria-label="Edit test type"
                      >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          setTestTypeToDelete(testType);
                          setShowConfirmModal(true);
                        }}
                        className="w-8 h-8 rounded-full bg-white/15 border border-white/30 flex items-center justify-center hover:bg-white/25 transition-colors cursor-pointer"
                        aria-label="Delete test type"
                      >
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="px-4 py-3 flex flex-col gap-2">
                    {testType.results.map((result) => (
                      <div
                        key={result}
                        className="text-sm text-[#212b36] font-poppins leading-[18px] border-b last:border-b-0 border-[#ecf0f4] pb-2 last:pb-0"
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setTestTypeToDelete(null);
        }}
        onConfirm={() => {
          if (testTypeToDelete) {
            onDelete?.(testTypeToDelete.id);
          }
          setShowConfirmModal(false);
          setTestTypeToDelete(null);
        }}
        title="Delete Test Type"
        message={`Are you sure you want to delete "${testTypeToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
