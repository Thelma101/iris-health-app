import React from 'react';

interface FormProgressProps {
  currentStep: number;
}

export default function FormProgress({ currentStep }: FormProgressProps) {
  const steps = [
    { number: 1, label: 'Patient\ninfo' },
    { number: 2, label: 'Test Details' },
    { number: 3, label: 'Upload Photos/Attachment' },
    { number: 4, label: 'Submit' },
  ];

  return (
    <div className="flex flex-col items-center gap-3 mb-8">
      <div className="flex items-center gap-1">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex items-center gap-1">
              <div
                className={`h-6 w-[25px] rounded-[20px] flex items-center justify-center text-xs font-semibold uppercase ${
                  currentStep >= step.number
                    ? 'bg-[#2c7be5] text-white'
                    : 'bg-white border border-[#d9d9d9] text-[#d9d9d9]'
                }`}
              >
                {currentStep > step.number ? '✓' : step.number}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 w-[51px] rounded ${
                    currentStep > step.number ? 'bg-[#2c7be5]' : 'bg-[#d9d9d9]'
                  }`}
                />
              )}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Step Labels */}
      <div className="flex items-start gap-[35px] text-center text-[10px] text-[#637381]">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`${step.label === 'Test Details' ? 'w-[38px]' : step.label === 'Upload Photos/Attachment' ? 'w-[60px]' : 'w-[43px]'} ${
              currentStep === step.number ? 'text-[#2c7be5]' : ''
            }`}
          >
            {step.label.split('\n').map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
