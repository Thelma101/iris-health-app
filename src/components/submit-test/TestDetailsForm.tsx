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
  const fields = [
    { key: 'testType' as const, label: 'Test Type', type: 'select', options: TEST_TYPE_OPTIONS },
    { key: 'testResult' as const, label: 'Test Result', type: 'select', options: TEST_RESULT_OPTIONS },
    { key: 'officerNote' as const, label: 'Officer Note', type: 'textarea' },
  ];

  return (
    <div className="flex flex-col gap-[26px]">
      {fields.map((field) => (
        <div key={field.key} className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#637381] font-poppins">{field.label}</label>

          {field.type === 'select' ? (
            <div className="relative h-12 rounded bg-white border border-[#d9d9d9]">
              <select
                value={testDetails[field.key]}
                onChange={(e) => onChange(field.key, e.target.value)}
                className="w-full h-full px-[22px] bg-transparent text-[#212b36] font-poppins appearance-none focus:outline-none cursor-pointer"
              >
                {field.options!.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <svg
                className="absolute top-1/2 right-[10px] -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          ) : field.type === 'textarea' ? (
            <textarea
              value={testDetails[field.key]}
              onChange={(e) => onChange(field.key, e.target.value)}
              className="w-full h-24 p-3 rounded bg-white border border-[#d9d9d9] text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none resize-none"
              placeholder={`Enter ${field.label.toLowerCase()}`}
            />
          ) : (
            <input
              type={field.type}
              value={testDetails[field.key]}
              onChange={(e) => onChange(field.key, e.target.value)}
              className="w-full h-12 px-[22px] bg-white border border-[#d9d9d9] rounded text-[#212b36] font-poppins focus:outline-none"
            />
          )}
        </div>
      ))}

      {/* Date Conducted Calendar Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#637381] font-poppins">Date Conducted</label>
        <input
          type="date"
          value={testDetails.dateConducted}
          onChange={(e) => onChange('dateConducted', e.target.value)}
          className="w-full h-12 px-[22px] bg-white border border-[#d9d9d9] rounded text-[#212b36] font-poppins focus:outline-none cursor-pointer"
        />
      </div>

      {/* Test Image Upload */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#637381] font-poppins">Test Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="w-full h-12 px-[22px] bg-white border border-[#d9d9d9] rounded text-[#212b36] font-poppins focus:outline-none"
        />
      </div>
    </div>
  );
}
