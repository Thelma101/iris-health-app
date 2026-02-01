import React from 'react';
import { GENDER_OPTIONS } from '@/lib/constants/location-options';

interface PatientInfo {
  lga: string;
  community: string;
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  phoneNumber: string;
}

interface CommunityOption {
  value: string;
  label: string;
  lga: string;
}

interface PatientInfoFormProps {
  formData: PatientInfo;
  onChange: (field: keyof PatientInfo, value: string) => void;
  communities?: CommunityOption[];
  lgas?: { value: string; label: string }[];
  loading?: boolean;
  onBlur?: (field: string) => void;
  errors?: Record<string, string | null>;
  touched?: Record<string, boolean>;
}

export default function PatientInfoForm({ 
  formData, 
  onChange, 
  communities = [], 
  lgas = [], 
  loading = false,
  onBlur,
  errors = {},
  touched = {},
}: PatientInfoFormProps) {
  
  // Get field error (only show if touched)
  const getFieldError = (fieldName: string): string | null => {
    return touched[fieldName] ? errors[fieldName] || null : null;
  };

  // Get CSS classes based on validation state
  const getFieldClasses = (fieldName: string): string => {
    const error = getFieldError(fieldName);
    const isTouched = touched[fieldName];
    const hasValue = !!formData[fieldName as keyof PatientInfo];
    
    if (error) {
      return 'border-red-500 focus:border-red-500 bg-red-50/30';
    }
    if (isTouched && hasValue) {
      return 'border-green-500 focus:border-green-500';
    }
    return 'border-[#d9d9d9] focus:border-[#2c7be5]';
  };
  // Filter communities by selected LGA
  const filteredCommunities = formData.lga
    ? communities.filter((c) => c.lga === formData.lga)
    : communities;

  const fields = [
    { key: 'lga' as const, label: 'LGA', options: lgas.map(l => l.label), type: 'select', required: true },
    { key: 'community' as const, label: 'Select Community', options: filteredCommunities.map(c => ({ value: c.value, label: c.label })), type: 'select-with-value', required: true },
    { key: 'firstName' as const, label: 'First Name', placeholder: 'Tayo', type: 'text', required: true },
    { key: 'lastName' as const, label: 'Last Name', placeholder: 'Ayo', type: 'text', required: true },
    { key: 'age' as const, label: 'Age', placeholder: '67', type: 'number', required: true },
    { key: 'gender' as const, label: 'Gender', options: GENDER_OPTIONS, type: 'select-with-value', required: true },
    { key: 'phoneNumber' as const, label: 'Phone Number', placeholder: '080537736267', type: 'tel', required: true },
  ];

  return (
    <div className="flex flex-col gap-[26px]">
      {loading ? (
        <div className="text-center text-gray-500 py-4">Loading communities...</div>
      ) : (
        fields.map((field) => (
          <div key={field.key} className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#637381] font-poppins">
              {field.label}
            </label>

            {field.type === 'select' ? (
              <div className={`relative h-12 rounded bg-white border ${getFieldClasses(field.key)}`}>
                <select
                  value={formData[field.key]}
                  onChange={(e) => {
                    onChange(field.key, e.target.value);
                    // Clear community when LGA changes
                    if (field.key === 'lga') {
                      onChange('community', '');
                    }
                  }}
                  onBlur={() => onBlur?.(field.key)}
                  className="w-full h-full px-[22px] bg-transparent text-[#212b36] font-poppins appearance-none focus:outline-none cursor-pointer"
                >
                  <option value="">Select {field.label}</option>
                  {(field.options as string[])!.map((option) => (
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
            ) : field.type === 'select-with-value' ? (
              <div className={`relative h-12 rounded bg-white border ${getFieldClasses(field.key)}`}>
                <select
                  value={formData[field.key]}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  onBlur={() => onBlur?.(field.key)}
                  className="w-full h-full px-[22px] bg-transparent text-[#212b36] font-poppins appearance-none focus:outline-none cursor-pointer"
                >
                  <option value="">Select {field.label}</option>
                  {(field.options as { value: string; label: string }[])!.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
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
            ) : (
              <div className={`h-12 rounded bg-white border ${getFieldClasses(field.key)}`}>
                <input
                  type={field.type}
                  value={formData[field.key]}
                  onChange={(e) => onChange(field.key, e.target.value)}
                  onBlur={() => onBlur?.(field.key)}
                  placeholder={field.placeholder}
                  className="w-full h-full px-[22px] bg-transparent text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none cursor-text"
                />
              </div>
            )}
            
            {/* Field error message */}
            {getFieldError(field.key) && (
              <p className="text-sm text-red-500 font-poppins flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {getFieldError(field.key)}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}
