'use client';

import React from 'react';

interface FormStepIndicatorProps {
  currentStep: number;
  steps: { label: string; subLabel?: string }[];
}

const CheckmarkIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#2C7BE5" />
    <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FormStepIndicator: React.FC<FormStepIndicatorProps> = ({
  currentStep,
  steps,
}) => {
  return (
    <div className="flex flex-col items-center gap-[11px]">
      {/* Step circles and lines */}
      <div className="flex items-center gap-1">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            {/* Step indicator */}
            {index < currentStep ? (
              <CheckmarkIcon />
            ) : (
              <div
                className={`w-[25px] h-[24px] rounded-full flex items-center justify-center ${
                  index === currentStep
                    ? 'bg-[#2c7be5] text-white'
                    : 'bg-white border border-[#d9d9d9] text-[#212b36]'
                }`}
              >
                <span className="font-poppins font-semibold text-xs uppercase">
                  {index + 1}
                </span>
              </div>
            )}
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`w-[51px] h-[2px] rounded ${
                  index < currentStep ? 'bg-[#2c7be5]' : 'bg-[#d9d9d9]'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step labels */}
      <div className="flex gap-[35px] w-[285px]">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`text-center text-[10px] font-poppins ${
              index === currentStep ? 'text-[#2c7be5]' : 'text-[#637381]'
            }`}
            style={{ width: index === 2 ? '60px' : index === 0 ? '43px' : index === 1 ? '38px' : '45px' }}
          >
            {step.subLabel ? (
              <>
                <p className="mb-0">{step.label}</p>
                <p>{step.subLabel}</p>
              </>
            ) : (
              <p>{step.label}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormStepIndicator;
