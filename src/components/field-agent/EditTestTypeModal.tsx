'use client';

import React, { useState, useEffect } from 'react';

interface TestType {
  id: string;
  name: string;
  results: string[];
}

interface EditTestTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  testType: TestType | null;
  onSubmit: (data: TestType) => void;
}

const EditTestTypeModal: React.FC<EditTestTypeModalProps> = ({
  isOpen,
  onClose,
  testType,
  onSubmit,
}) => {
  const [testTypeName, setTestTypeName] = useState('');
  const [results, setResults] = useState<string[]>(['', '']);

  useEffect(() => {
    if (testType) {
      setTestTypeName(testType.name);
      setResults(testType.results.length > 0 ? testType.results : ['', '']);
    }
  }, [testType]);

  if (!isOpen || !testType) return null;

  const handleAddResult = () => {
    setResults([...results, '']);
  };

  const handleRemoveResult = (index: number) => {
    if (results.length > 1) {
      setResults(results.filter((_, i) => i !== index));
    }
  };

  const handleResultChange = (index: number, value: string) => {
    const newResults = [...results];
    newResults[index] = value;
    setResults(newResults);
  };

  const handleSubmit = () => {
    const filteredResults = results.filter((r) => r.trim() !== '');
    if (testTypeName.trim() && filteredResults.length > 0) {
      onSubmit({ id: testType.id, name: testTypeName, results: filteredResults });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#f5f5f5] backdrop-blur-[10px] opacity-80"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-[10px] w-[625px] shadow-lg overflow-hidden">
        {/* Header */}
        <div className="h-12 bg-white border-b border-[#d9d9d9] flex items-center justify-between px-[22px]">
          <p className="font-poppins font-medium text-xl text-[#212b36]">
            Edit Test Type
          </p>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="#212B36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-[51px] pt-10">
          <div className="flex flex-col gap-[23px] mb-10">
            {/* Test Type Name */}
            <div className="flex flex-col gap-[6px]">
              <label className="font-poppins font-medium text-sm text-[#637381]">
                Test Type
              </label>
              <input
                type="text"
                value={testTypeName}
                onChange={(e) => setTestTypeName(e.target.value)}
                placeholder="e.g HIV"
                className="w-full h-12 px-[21px] bg-white border border-[#d9d9d9] rounded text-sm font-poppins text-[#212b36] placeholder:text-[#d9d9d9] focus:outline-none focus:border-[#2c7be5]"
              />
            </div>

            {/* Expected Results */}
            <div className="flex flex-col gap-[6px]">
              <label className="font-poppins font-medium text-sm text-[#637381]">
                Expected Result
              </label>
              {results.map((result, index) => (
                <div key={index} className="flex flex-col gap-[10px]">
                  <input
                    type="text"
                    value={result}
                    onChange={(e) => handleResultChange(index, e.target.value)}
                    placeholder={index === 0 ? 'e.g positive' : 'e.g Negative'}
                    className="w-full h-12 px-6 bg-white border border-[#d9d9d9] rounded text-sm font-poppins text-[#212b36] placeholder:text-[#d9d9d9] focus:outline-none focus:border-[#2c7be5]"
                  />
                </div>
              ))}
            </div>

            {/* Add/Remove buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleAddResult}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="#2C7BE5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {results.length > 1 && (
                <button
                  onClick={() => handleRemoveResult(results.length - 1)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6H5H21" stroke="#D64545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="#D64545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full h-12 bg-[#2c7be5] rounded-[10px] font-inter font-medium text-base text-white hover:bg-blue-600 transition-colors"
          >
            Update Test Type
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTestTypeModal;
