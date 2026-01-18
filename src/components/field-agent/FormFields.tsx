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
  enableCamera?: boolean;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Upload file',
  accept = 'image/*',
  preview = null,
  enableCamera = true,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const cameraRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleCameraClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    cameraRef.current?.click();
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
        className="w-full min-h-[125px] bg-white border border-dashed border-[#d9d9d9] rounded cursor-pointer flex flex-col items-center justify-center hover:border-[#2c7be5] transition-colors p-4"
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        {/* Camera input for mobile devices */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleChange}
          className="hidden"
        />
        {preview ? (
          <div className="flex flex-col items-center gap-2">
            <img
              src={preview}
              alt="Preview"
              className="max-h-[80px] max-w-full object-contain"
            />
            <p className="font-poppins text-xs text-[#637381]">Tap to change</p>
          </div>
        ) : value ? (
          <p className="font-poppins text-sm text-[#212b36]">{value.name}</p>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
                stroke="#637381"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="17,8 12,3 7,8"
                stroke="#637381"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="12"
                y1="3"
                x2="12"
                y2="15"
                stroke="#637381"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="font-poppins text-sm text-[#212b36] text-center">{placeholder}</p>
            {enableCamera && (
              <button
                type="button"
                onClick={handleCameraClick}
                className="flex items-center gap-2 px-4 py-2 bg-[#2c7be5] text-white rounded-lg text-sm font-poppins hover:bg-blue-600 transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="12"
                    cy="13"
                    r="4"
                    stroke="white"
                    strokeWidth="2"
                  />
                </svg>
                Take Photo
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export { SelectField, InputField, TextAreaField, DateField, FileUploadField };
