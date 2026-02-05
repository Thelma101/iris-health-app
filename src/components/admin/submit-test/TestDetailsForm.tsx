import React, { useRef, useState, useEffect } from 'react';
import { TEST_RESULT_OPTIONS } from '@/lib/constants/test-options';
import TestResultModal from './TestResultModal';
import api from '@/lib/api';

interface TestTypeOption {
  _id: string;
  name: string;
  results: string[];
}

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
  onOpenCameraCapture?: () => void;
  onBlur?: (field: string) => void;
  errors?: Record<string, string | null>;
  touched?: Record<string, boolean>;
}

export default function TestDetailsForm({ 
  testDetails, 
  onChange, 
  onImageChange,
  onOpenCameraCapture,
  onBlur,
  errors = {},
  touched = {},
}: TestDetailsFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [showTestResultModal, setShowTestResultModal] = useState(false);
  const [testTypeOptions, setTestTypeOptions] = useState<TestTypeOption[]>([]);

  // Fetch test types from API
  useEffect(() => {
    api.getTestTypes()
      .then((res) => {
        console.log('=== TEST DETAILS FORM: Fetched Test Types ===', res);
        const testData = res.data as any;
        const testTypesArray = testData?.data?.testTypes || testData?.testTypes || [];
        setTestTypeOptions(testTypesArray);
      })
      .catch((err) => {
        console.error('Error fetching test types:', err);
        // Fallback to default test types if API fails
        setTestTypeOptions([
          { _id: '1', name: 'HIV 1/2 Rapid Test', results: ['Positive', 'Negative', 'Inconclusive'] },
          { _id: '2', name: 'Malaria RDT', results: ['Positive', 'Negative', 'Invalid'] },
          { _id: '3', name: 'Blood Pressure', results: ['Normal', 'High', 'Low'] },
          { _id: '4', name: 'Blood Glucose', results: ['Normal', 'High', 'Low'] },
        ]);
      });
  }, []);

  // Get field error (only show if touched)
  const getFieldError = (fieldName: string): string | null => {
    return touched[fieldName] ? errors[fieldName] || null : null;
  };

  // Get CSS classes based on validation state - use focus-within for parent div
  const getFieldClasses = (fieldName: string): string => {
    const error = getFieldError(fieldName);
    
    if (error) {
      return 'border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-300 bg-red-50/30';
    }
    return 'border-[#d9d9d9] focus-within:border-[#2c7be5] focus-within:ring-2 focus-within:ring-[#2c7be5]/40';
  };

  const handleTakePhoto = () => {
    setShowUploadOptions(false);
    if (onOpenCameraCapture) {
      onOpenCameraCapture();
    } else {
      cameraInputRef.current?.click();
    }
  };

  const handleChooseExisting = () => {
    setShowUploadOptions(false);
    fileInputRef.current?.click();
  };

  const selectTextClass = testDetails.testType ? 'text-[#212b36]' : 'text-[#999]';
  const dateTextClass = testDetails.dateConducted ? 'text-[#212b36]' : 'text-[#999]';
  const testResultTextClass = testDetails.testResult ? 'text-[#212b36]' : 'text-[#999]';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#637381] font-poppins">Test Type</label>
        <div className={`relative h-12 rounded bg-white border ${getFieldClasses('testType')}`}>
          <select
            value={testDetails.testType}
            onChange={(e) => onChange('testType', e.target.value)}
            onBlur={() => onBlur?.('testType')}
            className={`w-full h-full px-5 bg-transparent text-sm font-poppins appearance-none focus:outline-none cursor-pointer ${selectTextClass}`}
          >
            <option value="" disabled hidden>
              Select test type
            </option>
            {testTypeOptions.map((option) => (
              <option key={option._id} value={option.name}>{option.name}</option>
            ))}
          </select>
          <svg className="absolute top-1/2 right-2.5 -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {getFieldError('testType') && (
          <p className="text-sm text-red-500 font-poppins flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {getFieldError('testType')}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#637381] font-poppins">Date Conducted</label>
        <div className={`relative h-12 rounded bg-white border ${getFieldClasses('dateConducted')}`}>
          <input
            type="date"
            value={testDetails.dateConducted}
            onChange={(e) => onChange('dateConducted', e.target.value)}
            onBlur={() => onBlur?.('dateConducted')}
            max={new Date().toISOString().split('T')[0]}
            className={`w-full h-full px-5 bg-transparent text-sm font-poppins focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer ${dateTextClass}`}
          />
          <svg className="absolute top-1/2 right-2.5 -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        {getFieldError('dateConducted') && (
          <p className="text-sm text-red-500 font-poppins flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {getFieldError('dateConducted')}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#637381] font-poppins">Test Result</label>
        <button
          type="button"
          onClick={() => setShowTestResultModal(true)}
          onBlur={() => onBlur?.('testResult')}
          className={`relative h-12 rounded bg-white border px-5 flex items-center justify-between text-left hover:border-[#2c7be5] transition-colors ${getFieldClasses('testResult')}`}
        >
          <span className={`text-sm font-poppins ${testResultTextClass}`}>
            {testDetails.testResult || 'Select test result'}
          </span>
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {getFieldError('testResult') && (
          <p className="text-sm text-red-500 font-poppins flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {getFieldError('testResult')}
          </p>
        )}
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
          onBlur={() => onBlur?.('officerNote')}
          className={`w-full h-24 p-3 rounded bg-white border text-sm placeholder:text-[#d9d9d9] font-poppins focus:outline-none resize-none ${getFieldClasses('officerNote')}`}
          placeholder="Enter officer note"
        />
        {getFieldError('officerNote') && (
          <p className="text-sm text-red-500 font-poppins flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {getFieldError('officerNote')}
          </p>
        )}
      </div>

      <div className="flex flex-col relative">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={onImageChange} className="hidden" />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={onImageChange} className="hidden" />

        <button
          type="button"
          onClick={() => setShowUploadOptions(!showUploadOptions)}
          className={`w-full h-36 rounded bg-white border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer ${
            getFieldError('testImage')
              ? 'border-red-500 bg-red-50/30 hover:border-red-600'
              : testDetails.testImage
                ? 'border-green-500 bg-green-50/30 hover:border-green-600'
                : 'border-[#d9d9d9] hover:border-[#2c7be5] hover:bg-blue-50/30'
          }`}
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

        {getFieldError('testImage') && (
          <p className="text-sm text-red-500 font-poppins flex items-center gap-1 mt-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {getFieldError('testImage')}
          </p>
        )}
      </div>
    </div>
  );
}
