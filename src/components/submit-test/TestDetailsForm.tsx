import React from 'react';
import { TEST_TYPE_OPTIONS, TEST_RESULT_OPTIONS } from '@/lib/constants/test-options';

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
  return (
    <div className="flex flex-col gap-5">
      {/* Test Type */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#637381] font-poppins">Test Type</label>
        <div className="relative">
          <select
            value={testDetails.testType}
            onChange={(e) => onChange('testType', e.target.value)}
            className="w-full h-12 px-4 bg-white border border-[#d9d9d9] rounded-lg text-[#212b36] font-poppins appearance-none focus:outline-none focus:border-[#2c7be5] cursor-pointer"
          >
            {TEST_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <svg
            className="absolute top-1/2 right-4 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Date Conducted */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#637381] font-poppins">Date Conducted</label>
        <div className="relative">
          <input
            type="date"
            value={testDetails.dateConducted}
            onChange={(e) => onChange('dateConducted', e.target.value)}
            placeholder="21/07/2024"
            className="w-full h-12 px-4 bg-white border border-[#d9d9d9] rounded-lg text-[#212b36] placeholder:text-[#919eab] font-poppins focus:outline-none focus:border-[#2c7be5] cursor-pointer"
          />
          <svg
            className="absolute top-1/2 right-4 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      {/* Test Result */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#637381] font-poppins">Test Result</label>
        <div className="relative">
          <select
            value={testDetails.testResult}
            onChange={(e) => onChange('testResult', e.target.value)}
            className="w-full h-12 px-4 bg-white border border-[#d9d9d9] rounded-lg text-[#212b36] font-poppins appearance-none focus:outline-none focus:border-[#2c7be5] cursor-pointer"
          >
            {TEST_RESULT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <svg
            className="absolute top-1/2 right-4 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Officer Note */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#637381] font-poppins">Officer Note</label>
        <textarea
          value={testDetails.officerNote}
          onChange={(e) => onChange('officerNote', e.target.value)}
          className="w-full h-[100px] p-4 rounded-lg bg-white border border-[#d9d9d9] text-[#212b36] placeholder:text-[#919eab] font-poppins focus:outline-none focus:border-[#2c7be5] resize-none"
          placeholder="Enter notes here..."
        />
      </div>

      {/* Upload Test Image */}
      <div className="flex flex-col gap-1.5">
        <label className="hidden text-sm font-medium text-[#637381] font-poppins">Test Image</label>
        <label className="flex items-center justify-center h-[80px] border-2 border-dashed border-[#d9d9d9] rounded-lg bg-white hover:border-[#2c7be5] hover:bg-blue-50/30 transition-colors cursor-pointer">
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-medium text-[#637381] font-poppins">Upload Test Image</span>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}
