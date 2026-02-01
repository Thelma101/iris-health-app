'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';

// Types for form validation
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface FieldValidation {
  [key: string]: ValidationRule;
}

export interface ValidationErrors {
  [key: string]: string | null;
}

export interface TouchedFields {
  [key: string]: boolean;
}

// Phone number validation regex (Nigerian format and others)
export const PHONE_REGEX = /^[0-9+\-\s()]{10,15}$/;

// Age validation
export const AGE_REGEX = /^[0-9]{1,3}$/;

// Name validation (letters, spaces, hyphens, apostrophes)
export const NAME_REGEX = /^[a-zA-Z\s\-']+$/;

/**
 * Comprehensive form validation hook with real-time validation support
 */
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationRules: FieldValidation
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate a single field
  const validateField = useCallback(
    (name: string, value: any): string | null => {
      const rules = validationRules[name];
      if (!rules) return null;

      // Required validation
      if (rules.required) {
        if (value === null || value === undefined || value === '') {
          return rules.message || `This field is required`;
        }
        if (typeof value === 'string' && value.trim() === '') {
          return rules.message || `This field is required`;
        }
        if (value instanceof File === false && Array.isArray(value) && value.length === 0) {
          return rules.message || `This field is required`;
        }
      }

      // Skip other validations if value is empty and not required
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return null;
      }

      // Min length validation
      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        return rules.message || `Minimum ${rules.minLength} characters required`;
      }

      // Max length validation
      if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        return rules.message || `Maximum ${rules.maxLength} characters allowed`;
      }

      // Pattern validation
      if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        return rules.message || `Invalid format`;
      }

      // Custom validation
      if (rules.custom) {
        return rules.custom(value);
      }

      return null;
    },
    [validationRules]
  );

  // Validate all fields
  const validateAllFields = useCallback((): ValidationErrors => {
    const newErrors: ValidationErrors = {};
    
    Object.keys(validationRules).forEach((fieldName) => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    return newErrors;
  }, [validateField, validationRules, values]);

  // Check if form is valid
  const isValid = useMemo(() => {
    const currentErrors = validateAllFields();
    return Object.keys(currentErrors).length === 0;
  }, [validateAllFields]);

  // Get first error message for display
  const firstError = useMemo(() => {
    const currentErrors = validateAllFields();
    const errorKeys = Object.keys(currentErrors);
    return errorKeys.length > 0 ? currentErrors[errorKeys[0]] : null;
  }, [validateAllFields]);

  // Update a single field value with validation
  const setValue = useCallback(
    (name: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      
      // Validate on change if field has been touched
      if (touched[name as string]) {
        const error = validateField(name as string, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [touched, validateField]
  );

  // Set multiple values at once
  const setMultipleValues = useCallback((newValues: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  // Mark field as touched (on blur)
  const setFieldTouched = useCallback(
    (name: string, isTouched = true) => {
      setTouched((prev) => ({ ...prev, [name]: isTouched }));
      
      // Validate on blur
      if (isTouched) {
        const error = validateField(name, values[name as keyof T]);
        setErrors((prev) => ({ ...prev, [name]: error }));
      }
    },
    [validateField, values]
  );

  // Touch all fields (useful before submission)
  const touchAllFields = useCallback(() => {
    const allTouched: TouchedFields = {};
    Object.keys(validationRules).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    // Validate all fields
    const newErrors = validateAllFields();
    setErrors(newErrors);
    
    return Object.keys(newErrors).length === 0;
  }, [validateAllFields, validationRules]);

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Get field error (only if touched)
  const getFieldError = useCallback(
    (name: string): string | null => {
      return touched[name] ? errors[name] || null : null;
    },
    [errors, touched]
  );

  // Check if field has error (only if touched)
  const hasFieldError = useCallback(
    (name: string): boolean => {
      return touched[name] && !!errors[name];
    },
    [errors, touched]
  );

  // Check if field is valid (touched and no error)
  const isFieldValid = useCallback(
    (name: string): boolean => {
      return touched[name] && !errors[name] && !!values[name as keyof T];
    },
    [errors, touched, values]
  );

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    firstError,
    setValue,
    setMultipleValues,
    setFieldTouched,
    touchAllFields,
    validateField,
    validateAllFields,
    resetForm,
    getFieldError,
    hasFieldError,
    isFieldValid,
    setIsSubmitting,
    setValues,
    setErrors,
  };
}

/**
 * Patient Info validation rules
 */
export const patientInfoValidationRules: FieldValidation = {
  lga: {
    required: true,
    message: 'Please select an LGA',
  },
  community: {
    required: true,
    message: 'Please select a community',
  },
  firstName: {
    required: true,
    minLength: 2,
    pattern: NAME_REGEX,
    message: 'Please enter a valid first name (letters only, min 2 characters)',
  },
  lastName: {
    required: true,
    minLength: 2,
    pattern: NAME_REGEX,
    message: 'Please enter a valid last name (letters only, min 2 characters)',
  },
  age: {
    required: true,
    pattern: AGE_REGEX,
    custom: (value) => {
      const age = parseInt(value, 10);
      if (isNaN(age) || age < 0 || age > 150) {
        return 'Please enter a valid age (0-150)';
      }
      return null;
    },
    message: 'Please enter a valid age',
  },
  gender: {
    required: true,
    message: 'Please select a gender',
  },
  phoneNumber: {
    required: true,
    pattern: PHONE_REGEX,
    message: 'Please enter a valid phone number (10-15 digits)',
  },
};

/**
 * Test Details validation rules
 */
export const testDetailsValidationRules: FieldValidation = {
  testType: {
    required: true,
    message: 'Please select a test type',
  },
  dateConducted: {
    required: true,
    custom: (value) => {
      if (!value) return 'Please select the date conducted';
      const date = new Date(value);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (date > today) {
        return 'Date cannot be in the future';
      }
      return null;
    },
    message: 'Please select a valid date',
  },
  testResult: {
    required: true,
    message: 'Please select a test result',
  },
};

/**
 * Photo Upload validation rules
 */
export const photoUploadValidationRules: FieldValidation = {
  patientPhoto: {
    required: true,
    custom: (value) => {
      if (!value) return 'Please upload a patient photo';
      if (value instanceof File) {
        // Check file size (max 10MB)
        if (value.size > 10 * 1024 * 1024) {
          return 'Photo size must be less than 10MB';
        }
        // Check file type
        if (!value.type.startsWith('image/')) {
          return 'Please upload a valid image file';
        }
      }
      return null;
    },
    message: 'Please upload a patient photo',
  },
};

/**
 * Get CSS classes for field with validation state
 */
export function getFieldClasses(
  hasError: boolean,
  isValid: boolean,
  baseClasses: string = ''
): string {
  const errorClasses = 'border-red-500 focus:border-red-500 bg-red-50/30';
  const validClasses = 'border-green-500 focus:border-green-500';
  const defaultClasses = 'border-[#d9d9d9] focus:border-[#2c7be5]';

  if (hasError) {
    return `${baseClasses} ${errorClasses}`;
  }
  if (isValid) {
    return `${baseClasses} ${validClasses}`;
  }
  return `${baseClasses} ${defaultClasses}`;
}

/**
 * Hook to prevent form bypass via keyboard shortcuts
 */
export function usePreventFormBypass(
  isFormValid: boolean,
  currentStep: number,
  maxStep: number
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Enter key from submitting if form is invalid
      if (e.key === 'Enter' && !isFormValid && currentStep < maxStep) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      // Prevent Ctrl+Enter / Cmd+Enter bypass
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !isFormValid) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isFormValid, currentStep, maxStep]);
}
