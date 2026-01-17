'use client';

import React from 'react';

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled = false,
}) => {
  return (
    <div className="flex flex-col gap-[6px] w-full">
      <label className="font-poppins font-medium text-sm text-[#637381]">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full h-12 px-[21px] pr-10 bg-white border border-[#d9d9d9] rounded text-sm font-poppins text-[#212b36] appearance-none focus:outline-none focus:border-[#2c7be5]"
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-[9px] top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 9L12 15L18 9"
              stroke="#637381"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  disabled = false,
}) => {
  return (
    <div className="flex flex-col gap-[6px] w-full">
      <label className="font-poppins font-medium text-sm text-[#637381]">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full h-12 px-[21px] bg-white border border-[#d9d9d9] rounded text-sm font-poppins text-[#212b36] placeholder:text-[#d9d9d9] focus:outline-none focus:border-[#2c7be5]"
      />
    </div>
  );
};

interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = '',
  rows = 4,
}) => {
  return (
    <div className="flex flex-col gap-[6px] w-full">
      <label className="font-poppins font-medium text-sm text-[#637381]">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-[21px] py-3 bg-white border border-[#d9d9d9] rounded text-sm font-poppins text-[#212b36] placeholder:text-[#d9d9d9] focus:outline-none focus:border-[#2c7be5] resize-none"
      />
    </div>
  );
};

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const DateField: React.FC<DateFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = 'DD/MM/YYYY',
}) => {
  return (
    <div className="flex flex-col gap-[6px] w-full">
      <label className="font-poppins font-medium text-sm text-[#637381]">
        {label}
      </label>
      <div className="relative">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-12 px-[21px] pr-10 bg-white border border-[#d9d9d9] rounded text-sm font-poppins text-[#212b36] placeholder:text-[#d9d9d9] focus:outline-none focus:border-[#2c7be5]"
        />
        <div className="absolute right-[9px] top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="#637381" strokeWidth="2" />
            <path d="M16 2V6" stroke="#637381" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 2V6" stroke="#637381" strokeWidth="2" strokeLinecap="round" />
            <path d="M3 10H21" stroke="#637381" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
};

interface FileUploadFieldProps {
  label: string;
  value: File | null;
  onChange: (file: File | null) => void;
  placeholder?: string;
  accept?: string;
  preview?: string | null;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Upload file',
  accept = 'image/*',
  preview = null,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
  };

  return (
    <div className="flex flex-col gap-[6px] w-full">
      {label && (
        <label className="font-poppins font-medium text-sm text-[#637381]">
          {label}
        </label>
      )}
      <div
        onClick={handleClick}
        className="w-full h-[125px] bg-white border border-dashed border-[#d9d9d9] rounded cursor-pointer flex items-center justify-center hover:border-[#2c7be5] transition-colors"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="max-h-full max-w-full object-contain"
          />
        ) : value ? (
          <p className="font-poppins text-sm text-[#212b36]">{value.name}</p>
        ) : (
          <p className="font-poppins text-sm text-[#212b36]">{placeholder}</p>
        )}
      </div>
    </div>
  );
};

export { SelectField, InputField, TextAreaField, DateField, FileUploadField };
