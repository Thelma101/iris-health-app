import React from 'react';
import { LGA_OPTIONS, COMMUNITY_OPTIONS, GENDER_OPTIONS } from '@/lib/constants/location-options';

interface PatientInfo {
  lga: string;
  community: string;
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  phoneNumber: string;
}

interface PatientInfoFormProps {
  formData: PatientInfo;
  onChange: (field: keyof PatientInfo, value: string) => void;
}

export default function PatientInfoForm({ formData, onChange }: PatientInfoFormProps) {
  const fields = [
    { key: 'lga' as const, label: 'LGA', options: LGA_OPTIONS, type: 'select' },
    { key: 'community' as const, label: 'Select Community', options: COMMUNITY_OPTIONS, type: 'select' },
    { key: 'firstName' as const, label: 'First Name', placeholder: 'Tayo', type: 'text' },
    { key: 'lastName' as const, label: 'Last Name', placeholder: 'Ayo', type: 'text' },
    { key: 'age' as const, label: 'Age', placeholder: '67', type: 'number' },
    { key: 'gender' as const, label: 'Gender', options: GENDER_OPTIONS, type: 'select' },
    { key: 'phoneNumber' as const, label: 'Phone Number', placeholder: '080537736267', type: 'tel' },
  ];

  return (
    <div className="flex flex-col gap-[26px]">
      {fields.map((field) => (
        <div key={field.key} className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#637381] font-poppins">{field.label}</label>

          {field.type === 'select' ? (
            <div className="relative h-12 rounded bg-white border border-[#d9d9d9]">
              <select
                value={formData[field.key]}
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
          ) : (
            <div className="h-12 rounded bg-white border border-[#d9d9d9]">
              <input
                type={field.type}
                value={formData[field.key]}
                onChange={(e) => onChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full h-full px-[22px] bg-transparent text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none cursor-text"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
