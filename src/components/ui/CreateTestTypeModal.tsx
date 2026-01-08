'use client';
import React, { useState } from 'react';
import SuccessModal from './SuccessModal';

interface CreateTestTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (testType: string, expectedResults: string[]) => void;
}

export default function CreateTestTypeModal({ isOpen, onClose, onAdd }: CreateTestTypeModalProps) {
  const [testType, setTestType] = useState('');
  const [expectedResults, setExpectedResults] = useState<string[]>(['', '']);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleAddResult = () => {
    setExpectedResults([...expectedResults, '']);
  };

  const handleResultChange = (index: number, value: string) => {
    const newResults = [...expectedResults];
    newResults[index] = value;
    setExpectedResults(newResults);
  };

  const handleRemoveResult = (index: number) => {
    if (expectedResults.length > 1) {
      setExpectedResults(expectedResults.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    if (testType && expectedResults.some(r => r.trim())) {
      onAdd?.(testType, expectedResults.filter(r => r.trim()));
      setSuccessMessage(`Test type "${testType}" has been added successfully!`);
      setShowSuccessModal(true);
      setTestType('');
      setExpectedResults(['', '']);
      onClose();
    } else {
      setSuccessMessage('Please enter a test type name and at least one expected result.');
      setShowSuccessModal(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm cursor-pointer" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-[625px] rounded-[10px] bg-white overflow-hidden shadow-lg mx-4">
        {/* Header */}
        <div className="bg-white border-b border-[#d9d9d9] h-12 flex items-center justify-between px-[22px]">
          <div className="font-medium text-xl text-[#212b36] font-poppins">Create New Test Type</div>
          <button onClick={onClose} className="cursor-pointer hover:opacity-70 transition-opacity">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-[51px] pt-[39px]">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-[23px]">
              {/* Test Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#637381] font-poppins">Test Type</label>
                <div className="h-12 rounded bg-white border border-[#d9d9d9]">
                  <input
                    type="text"
                    value={testType}
                    onChange={(e) => setTestType(e.target.value)}
                    placeholder="e.g HIV"
                    className="w-full h-full px-[22px] bg-transparent text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none cursor-text"
                  />
                </div>
              </div>

              {/* Expected Results */}
              {expectedResults.map((result, index) => (
                <div key={index} className="flex flex-col gap-1.5">
                  {index === 0 && (
                    <label className="text-sm font-medium text-[#637381] font-poppins">Expected Result</label>
                  )}
                  <div className="flex gap-2">
                    <div className="flex-1 h-12 rounded bg-white border border-[#d9d9d9]">
                      <input
                        type="text"
                        value={result}
                        onChange={(e) => handleResultChange(index, e.target.value)}
                        placeholder={index === 0 ? "e.g positive" : "e.g Negative"}
                        className="w-full h-full px-[22px] bg-transparent text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none cursor-text"
                      />
                    </div>
                    {expectedResults.length > 1 && (
                      <button
                        onClick={() => handleRemoveResult(index)}
                        className="w-12 h-12 flex items-center justify-center text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add More Result Button */}
              <button
                onClick={handleAddResult}
                className="flex items-center gap-2 text-[#2c7be5] font-medium font-poppins hover:opacity-70 transition-opacity cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add another result option
              </button>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full h-12 rounded-[10px] bg-[#2c7be5] text-white font-medium font-inter hover:bg-blue-600 transition-colors cursor-pointer"
            >
              Add Test Type
            </button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successMessage.includes('successfully') ? 'Success!' : 'Error'}
        message={successMessage}
      />
    </div>
  );
}

