import React from 'react';

interface FormProgressProps {
  currentStep: number;
}

export default function FormProgress({ currentStep }: FormProgressProps) {
  const steps = [
    { number: 1, label: 'Patient Info' },
    { number: 2, label: 'Test Details' },
    { number: 3, label: 'Upload Photos/ Attachment' },
    { number: 4, label: 'Submit' },
  ];

  return (
    <div className="flex flex-col items-center gap-2 mb-8">
      {/* Progress Line with Circles */}
      <div className="flex items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            {/* Step Circle */}
            <div
              className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                currentStep > step.number
                  ? 'bg-[#2c7be5] text-white'
                  : currentStep === step.number
                  ? 'bg-[#2c7be5] text-white'
                  : 'bg-white border-2 border-[#d9d9d9] text-[#d9d9d9]'
              }`}
            >
              {currentStep > step.number ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.number
              )}
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 w-12 sm:w-16 ${
                  currentStep > step.number ? 'bg-[#2c7be5]' : 'bg-[#d9d9d9]'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Labels */}
      <div className="flex items-start justify-between w-full max-w-[400px] px-0">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`text-center text-[10px] sm:text-xs font-medium max-w-[70px] ${
              currentStep === step.number ? 'text-[#2c7be5]' : 'text-[#637381]'
            }`}
          >
            {step.label}
          </div>
        ))}
      </div>
    </div>
  );
}
