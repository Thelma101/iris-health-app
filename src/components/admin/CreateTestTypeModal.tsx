'use client';
import React, { useState } from 'react';
import SuccessModal from './SuccessModal';
import api from '@/lib/api';

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
  const [isSaving, setIsSaving] = useState(false);

  const handleAddResult = () => {
    setExpectedResults([...expectedResults, '']);
  };

  const handleResultChange = (index: number, value: string) => {
    const newResults = [...expectedResults];
    newResults[index] = value;
    setExpectedResults(newResults);
  };

  const handleSubmit = async () => {
    if (!testType.trim() || !expectedResults.some(r => r.trim())) {
      setSuccessMessage('Please enter a test type name and at least one expected result.');
      setShowSuccessModal(true);
      return;
    }

    setIsSaving(true);
    try {
      const filteredResults = expectedResults.filter(r => r.trim());
      const res = await api.createTestType({ name: testType.trim(), allowedResults: filteredResults });
      if (res.success) {
        const savedTestType = testType;
        onAdd?.(testType, filteredResults);
        setTestType('');
        setExpectedResults(['', '']);
        setSuccessMessage(`Test type "${savedTestType}" has been added successfully!`);
        setShowSuccessModal(true);
      } else {
        setSuccessMessage(res.error || 'Failed to create test type. Please try again.');
        setShowSuccessModal(true);
      }
    } catch {
      setSuccessMessage('Failed to create test type. Please try again.');
      setShowSuccessModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    if (successMessage.includes('successfully')) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      />

      <div className="relative w-full max-w-[625px] rounded-[10px] bg-white overflow-hidden shadow-lg">
        <div className="bg-[#f8f9fa] border-b border-[#d9d9d9] h-12 flex items-center justify-between px-[22px]">
          <div className="font-medium text-xl text-[#212b36] font-poppins">Create New Test Type</div>
          <button onClick={onClose} className="cursor-pointer hover:opacity-70 transition-opacity">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 sm:p-[51px] sm:pt-[39px]">
          <div className="flex flex-col gap-6 sm:gap-10">
            <div className="flex flex-col gap-[23px]">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#637381] font-poppins">Test Type</label>
                <div className="h-12 rounded bg-white border border-[#d9d9d9]">
                  <input
                    type="text"
                    value={testType}
                    onChange={(e) => setTestType(e.target.value)}
                    placeholder="e.g HIV"
                    className="w-full h-full px-[22px] bg-transparent text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2c7be5]/40 focus-visible:border-[#2c7be5] cursor-text"
                  />
                </div>
              </div>

              {expectedResults.map((result, index) => (
                <div key={index} className="flex flex-col gap-1.5">
                  {index === 0 && (
                    <label className="text-sm font-medium text-[#637381] font-poppins">Expected Result</label>
                  )}
                  <div className="h-12 rounded bg-white border border-[#d9d9d9]">
                    <input
                      type="text"
                      value={result}
                      onChange={(e) => handleResultChange(index, e.target.value)}
                      placeholder={index === 0 ? "e.g positive" : "e.g Negative"}
                      className="w-full min-w-0 h-full px-[22px] bg-transparent text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2c7be5]/40 focus-visible:border-[#2c7be5] cursor-text"
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddResult}
                className="flex items-center text-[#637381] font-medium font-poppins hover:opacity-70 transition-opacity cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSaving}
              className={`w-full h-12 rounded-[10px] text-white font-medium font-inter transition-colors cursor-pointer ${isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#2c7be5] hover:bg-blue-600'}`}
            >
              {isSaving ? 'Saving...' : 'Add Test Type'}
            </button>
          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title={successMessage.includes('successfully') ? 'Success!' : 'Error'}
        message={successMessage}
      />
    </div>
  );
}

