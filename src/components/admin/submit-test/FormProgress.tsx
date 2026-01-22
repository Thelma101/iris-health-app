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
    <div className="flex flex-col items-center gap-[11px] mb-8">
      <div className="flex items-center gap-1">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex items-center gap-1">
              {/* Step Circle */}
              {currentStep > step.number ? (
                // Completed step - show checkmark
                <div className="h-6 w-6 rounded-full bg-[#2c7be5] flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                // Current or future step - show number
                <div
                  className={`h-6 w-[25px] rounded-[20px] flex items-center justify-center text-xs font-semibold font-poppins uppercase ${
                    currentStep === step.number
                      ? 'bg-[#2c7be5] text-white'
                      : 'bg-white border border-[#d9d9d9] text-[#d9d9d9]'
                  }`}
                >
                  {step.number}
                </div>
              )}
              {/* Connector line */}
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
      <div className="flex items-start gap-[35px] text-center text-[10px] font-poppins">
        {steps.map((step) => (
          <div
            key={step.number}
            className={`whitespace-pre-wrap ${
              step.label === 'Test Details' ? 'w-[38px]' : step.label === 'Upload Photos/Attachment' ? 'w-[60px]' : step.label === 'Submit' ? 'w-[45px]' : 'w-[43px]'
            } ${
              currentStep === step.number ? 'text-[#2c7be5]' : 'text-[#637381]'
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
