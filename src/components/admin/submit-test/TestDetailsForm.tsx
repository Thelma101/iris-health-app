import React, { useRef, useState, useEffect, useMemo } from 'react';
import TestResultModal from './TestResultModal';
import { calculateBMI, classifyBloodPressure, getBMICategoryColor, getBPCategoryColor } from '@/lib/utils/bmiCalculator';

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
  // Health metrics
  heightCm: string;
  weightKg: string;
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  glucoseLevel: string;
  glucoseUnit: string;
}

interface TestDetailsFormProps {
  testDetails: TestDetails;
  onChange: (field: keyof TestDetails, value: string) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenCameraCapture?: () => void;
  onBlur?: (field: string) => void;
  errors?: Record<string, string | null>;
  touched?: Record<string, boolean>;
  testTypes?: TestTypeOption[];
  testTypesLoading?: boolean;
  /** When true, replaces the test-result dropdown with a free-text BP input (format: 120/80) */
  useFreeTextBP?: boolean;
  /** When true, hides the Health Metrics section (used when metrics are shown on a separate step) */
  hideHealthMetrics?: boolean;
  /** When true, hides the Test Result field */
  hideTestResult?: boolean;
  /** When true, hides the Upload Test Image section */
  hideTestImage?: boolean;
}

export default function TestDetailsForm({ 
  testDetails, 
  onChange, 
  onImageChange,
  onOpenCameraCapture,
  onBlur,
  errors = {},
  touched = {},
  testTypes: testTypesProp = [],
  testTypesLoading = false,
  useFreeTextBP = false,
  hideHealthMetrics = false,
  hideTestResult = false,
  hideTestImage = false,
}: TestDetailsFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [showTestResultModal, setShowTestResultModal] = useState(false);
  const [availableResults, setAvailableResults] = useState<string[]>([]);
  const [bpInputError, setBpInputError] = useState<string | null>(null);

  // Use test types from prop (parent manages fetch)
  const testTypeOptions = testTypesProp;

  // Track if selected test type has no configured results
  const [noResultsConfigured, setNoResultsConfigured] = useState(false);

  // Update available results when test type changes  
  useEffect(() => {
    if (testDetails.testType) {
      // testDetails.testType now stores the _id, so find by _id
      const selectedTestType = testTypeOptions.find(t => t._id === testDetails.testType);
      if (selectedTestType) {
        // Only use results if they exist and are not empty
        const results = selectedTestType.results && selectedTestType.results.length > 0 
          ? selectedTestType.results 
          : [];
        setAvailableResults(results);
        setNoResultsConfigured(results.length === 0);
      } else {
        setAvailableResults([]);
        setNoResultsConfigured(false);
      }
    } else {
      setAvailableResults([]);
      setNoResultsConfigured(false);
    }
  }, [testDetails.testType, testTypeOptions]);

  // Get display name for currently selected test type
  const getSelectedTestTypeName = () => {
    if (!testDetails.testType) return '';
    const selectedTestType = testTypeOptions.find(t => t._id === testDetails.testType);
    return selectedTestType?.name || '';
  };

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

  const selectTextClass = testDetails.testType && getSelectedTestTypeName() ? 'text-[#212b36]' : 'text-[#999]';
  const dateTextClass = testDetails.dateConducted ? 'text-[#212b36]' : 'text-[#999]';
  const testResultTextClass = testDetails.testResult ? 'text-[#212b36]' : 'text-[#999]';
  const bpPattern = /^\d{2,3}\/\d{2,3}$/;

  // Auto-calculate BMI when height/weight change
  const bmiResult = useMemo(() => {
    const h = testDetails.heightCm ? parseFloat(testDetails.heightCm) : null;
    const w = testDetails.weightKg ? parseFloat(testDetails.weightKg) : null;
    return calculateBMI(w, h);
  }, [testDetails.heightCm, testDetails.weightKg]);

  // Auto-classify BP
  const bpCategory = useMemo(() => {
    const s = testDetails.bloodPressureSystolic ? parseInt(testDetails.bloodPressureSystolic, 10) : null;
    const d = testDetails.bloodPressureDiastolic ? parseInt(testDetails.bloodPressureDiastolic, 10) : null;
    return classifyBloodPressure(s, d);
  }, [testDetails.bloodPressureSystolic, testDetails.bloodPressureDiastolic]);

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
              {testTypesLoading ? 'Loading test types...' : testTypeOptions.length === 0 ? 'No test types available — create one first' : 'Select test type'}
            </option>
            {testTypeOptions.map((option) => (
              <option key={option._id} value={option._id}>{option.name}</option>
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

      {!hideTestResult && (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-[#637381] font-poppins">
          {useFreeTextBP ? 'Blood Pressure (mmHg)' : 'Test Result'}
        </label>
        {useFreeTextBP ? (
          <div className={`relative h-12 rounded bg-white border ${getFieldClasses('testResult')}`}>
            <input
              type="text"
              value={testDetails.testResult}
              onChange={(e) => {
                const value = e.target.value;
                onChange('testResult', value);
                if (bpPattern.test(value.trim())) {
                  setBpInputError(null);
                }
              }}
              onBlur={() => {
                const value = testDetails.testResult.trim();
                if (!bpPattern.test(value)) {
                  setBpInputError('Enter BP in format 120/80');
                } else {
                  setBpInputError(null);
                }
                onBlur?.('testResult');
              }}
              maxLength={10}
              placeholder="120/80"
              className="w-full h-full px-[22px] bg-transparent text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none cursor-text"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => testDetails.testType && !noResultsConfigured ? setShowTestResultModal(true) : null}
            onBlur={() => onBlur?.('testResult')}
            disabled={!testDetails.testType || noResultsConfigured}
            className={`relative h-12 rounded bg-white border px-5 flex items-center justify-between text-left transition-colors ${
              !testDetails.testType || noResultsConfigured
                ? 'opacity-60 cursor-not-allowed border-[#d9d9d9]' 
                : `hover:border-[#2c7be5] cursor-pointer ${getFieldClasses('testResult')}`
            }`}
          >
            <span className={`text-sm font-poppins ${testResultTextClass}`}>
              {!testDetails.testType 
                ? 'Select a test type first' 
                : noResultsConfigured
                ? 'No results configured for this test type'
                : testDetails.testResult || 'Select test result'}
            </span>
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
        {!useFreeTextBP && !testDetails.testType && (
          <p className="text-sm text-[#637381] font-poppins">
            Please select a test type to see available results
          </p>
        )}
        {!useFreeTextBP && noResultsConfigured && testDetails.testType && (
          <p className="text-sm text-amber-600 font-poppins flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            This test type has no configured results. Please configure results via Admin settings.
          </p>
        )}
        {getFieldError('testResult') && (
          <p className="text-sm text-red-500 font-poppins flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {getFieldError('testResult')}
          </p>
        )}
        {useFreeTextBP && bpInputError && !getFieldError('testResult') && (
          <p className="text-sm text-red-500 font-poppins flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {bpInputError}
          </p>
        )}
      </div>
      )}

      {!hideTestResult && !useFreeTextBP && (
        <TestResultModal
          isOpen={showTestResultModal}
          selectedValue={testDetails.testResult}
          onSelect={(value) => onChange('testResult', value)}
          onClose={() => setShowTestResultModal(false)}
          options={availableResults}
        />
      )}

      {!hideHealthMetrics && (
        <>
          {/* Health Metrics Section */}
          <div className="flex flex-col gap-2 mt-2">
            <div className="h-8 bg-[#ecf4ff] rounded px-3 flex items-center">
              <span className="text-sm font-medium text-[#2c7be5] font-poppins">Health Metrics</span>
            </div>

            {/* Height & Weight Row */}
            <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#637381] font-poppins">Height (cm)</label>
            <div className={`h-12 rounded bg-white border ${getFieldClasses('heightCm')}`}>
              <input
                type="number"
                step="0.1"
                min="0"
                max="300"
                value={testDetails.heightCm}
                onChange={(e) => onChange('heightCm', e.target.value)}
                onBlur={() => onBlur?.('heightCm')}
                placeholder="e.g. 170"
                className="w-full h-full px-[22px] bg-transparent text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none cursor-text"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#637381] font-poppins">Weight (kg)</label>
            <div className={`h-12 rounded bg-white border ${getFieldClasses('weightKg')}`}>
              <input
                type="number"
                step="0.1"
                min="0"
                max="500"
                value={testDetails.weightKg}
                onChange={(e) => onChange('weightKg', e.target.value)}
                onBlur={() => onBlur?.('weightKg')}
                placeholder="e.g. 70"
                className="w-full h-full px-[22px] bg-transparent text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none cursor-text"
              />
            </div>
          </div>
        </div>

        {/* BMI Auto-calculated Display */}
        {bmiResult && (
          <div className="flex items-center gap-3 p-3 rounded border border-[#d9d9d9] bg-gray-50">
            <span className="text-sm font-medium text-[#637381] font-poppins">BMI:</span>
            <span className="text-sm font-semibold text-[#212b36] font-poppins">{bmiResult.bmi}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getBMICategoryColor(bmiResult.category)}`}>
              {bmiResult.category}
            </span>
          </div>
        )}

        {/* Blood Pressure Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#637381] font-poppins">BP Systolic (mmHg)</label>
            <div className={`h-12 rounded bg-white border ${getFieldClasses('bloodPressureSystolic')}`}>
              <input
                type="number"
                min="0"
                max="300"
                value={testDetails.bloodPressureSystolic}
                onChange={(e) => onChange('bloodPressureSystolic', e.target.value)}
                onBlur={() => onBlur?.('bloodPressureSystolic')}
                placeholder="e.g. 120"
                className="w-full h-full px-[22px] bg-transparent text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none cursor-text"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#637381] font-poppins">BP Diastolic (mmHg)</label>
            <div className={`h-12 rounded bg-white border ${getFieldClasses('bloodPressureDiastolic')}`}>
              <input
                type="number"
                min="0"
                max="200"
                value={testDetails.bloodPressureDiastolic}
                onChange={(e) => onChange('bloodPressureDiastolic', e.target.value)}
                onBlur={() => onBlur?.('bloodPressureDiastolic')}
                placeholder="e.g. 80"
                className="w-full h-full px-[22px] bg-transparent text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none cursor-text"
              />
            </div>
          </div>
        </div>

        {/* BP Category Display */}
        {bpCategory && (
          <div className="flex items-center gap-3 p-3 rounded border border-[#d9d9d9] bg-gray-50">
            <span className="text-sm font-medium text-[#637381] font-poppins">Blood Pressure:</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getBPCategoryColor(bpCategory)}`}>
              {bpCategory}
            </span>
          </div>
        )}

        {/* Glucose Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#637381] font-poppins">Glucose Level</label>
            <div className={`h-12 rounded bg-white border ${getFieldClasses('glucoseLevel')}`}>
              <input
                type="number"
                step="0.1"
                min="0"
                value={testDetails.glucoseLevel}
                onChange={(e) => onChange('glucoseLevel', e.target.value)}
                onBlur={() => onBlur?.('glucoseLevel')}
                placeholder="e.g. 95"
                className="w-full h-full px-[22px] bg-transparent text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none cursor-text"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#637381] font-poppins">Glucose Unit</label>
            <div className={`relative h-12 rounded bg-white border ${getFieldClasses('glucoseUnit')}`}>
              <select
                value={testDetails.glucoseUnit}
                onChange={(e) => onChange('glucoseUnit', e.target.value)}
                className="w-full h-full px-5 bg-transparent text-sm font-poppins appearance-none focus:outline-none cursor-pointer text-[#212b36]"
              >
                <option value="mg/dL">mg/dL</option>
                <option value="mmol/L">mmol/L</option>
              </select>
              <svg className="absolute top-1/2 right-2.5 -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
            </div>
          </div>
        </>
      )}

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

      {!hideTestImage && (
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
      )}
    </div>
  );
}
