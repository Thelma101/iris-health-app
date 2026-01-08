import { useState } from 'react';

export type FormStep = 1 | 2 | 3 | 4;

export function useFormStep(initialStep: FormStep = 1) {
  const [currentStep, setCurrentStep] = useState<FormStep>(initialStep);

  const goToStep = (step: FormStep) => {
    setCurrentStep(step);
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as FormStep);
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as FormStep);
    }
  };

  return {
    currentStep,
    goToStep,
    nextStep,
    previousStep,
  };
}
