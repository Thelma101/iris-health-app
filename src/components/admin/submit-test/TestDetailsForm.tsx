import React, { useRef, useState } from 'react';
import { TEST_TYPE_OPTIONS, TEST_RESULT_OPTIONS } from '@/lib/constants/test-options';
import TestResultModal from './TestResultModal';

interface TestDetails {
  testType: string;
  dateConducted: string;
  testResult: string;
  officerNote: string;
  testImage: File | null;
}

interface TestDetailsFormProps {
  testDetails: TestDetails;
  onChange: (field: keyof TestDetails, value: string) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function TestDetailsForm({ testDetails, onChange, onImageChange }: TestDetailsFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [showTestResultModal, setShowTestResultModal] = useState(false);

  const handleTakePhoto = () => {
    setShowUploadOptions(false);
    cameraInputRef.current?.click();
  };

  const handleChooseExisting = () => {
    setShowUploadOptions(false);
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#637381] font-poppins">Test Type</label>
        <div className="relative h-12 rounded bg-white border border-[#d9d9d9]">
          <select
            value={testDetails.testType}
            onChange={(e) => onChange('testType', e.target.value)}
            className="w-full h-full px-5 bg-transparent text-[#212b36] text-sm font-poppins appearance-none focus:outline-none cursor-pointer"
          >
            {TEST_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <svg className="absolute top-1/2 right-2.5 -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#637381] font-poppins">Date Conducted</label>
        <div className="relative h-12 rounded bg-white border border-[#d9d9d9]">
          <input
            type="date"
            value={testDetails.dateConducted}
            onChange={(e) => onChange('dateConducted', e.target.value)}
            className="w-full h-full px-5 bg-transparent text-[#212b36] text-sm font-poppins focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          />
          <svg className="absolute top-1/2 right-2.5 -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#637381] font-poppins">Test Result</label>
        <button
          type="button"
          onClick={() => setShowTestResultModal(true)}
          className="relative h-12 rounded bg-white border border-[#d9d9d9] px-5 flex items-center justify-between text-left hover:border-[#2c7be5] transition-colors"
        >
          <span className="text-[#212b36] text-sm font-poppins">
            {testDetails.testResult || 'Select test result'}
          </span>
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <TestResultModal
        isOpen={showTestResultModal}
        selectedValue={testDetails.testResult}
        onSelect={(value) => onChange('testResult', value)}
        onClose={() => setShowTestResultModal(false)}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#637381] font-poppins">Officer Note</label>
        <textarea
          value={testDetails.officerNote}
          onChange={(e) => onChange('officerNote', e.target.value)}
          className="w-full h-24 p-3 rounded bg-white border border-[#d9d9d9] text-[#212b36] text-sm placeholder:text-[#d9d9d9] font-poppins focus:outline-none resize-none"
          placeholder="Enter officer note"
        />
      </div>

      <div className="flex flex-col relative">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={onImageChange} className="hidden" />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={onImageChange} className="hidden" />

        <button
          type="button"
          onClick={() => setShowUploadOptions(!showUploadOptions)}
          className="w-full h-36 rounded bg-white border-2 border-dashed border-[#d9d9d9] flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <span className="text-[#637381] text-base font-medium font-poppins">Upload Test Image</span>
        </button>

        {showUploadOptions && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowUploadOptions(false)} />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-56 bg-white rounded-lg shadow-lg border border-[#d9d9d9] z-50 overflow-hidden">
              <button type="button" onClick={handleTakePhoto} className="w-full px-4 py-3 text-left text-[#212b36] text-base font-poppins hover:bg-gray-50 transition-colors border-b border-[#d9d9d9]">
                Take photo
              </button>
              <button type="button" onClick={handleChooseExisting} className="w-full px-4 py-3 text-left text-[#212b36] text-base font-poppins hover:bg-gray-50 transition-colors">
                Choose existing photo
              </button>
            </div>
          </>
        )}

        {testDetails.testImage && (
          <p className="mt-2 text-sm text-[#637381] font-poppins">Selected: {testDetails.testImage.name}</p>
        )}
      </div>
    </div>
  );
}
