'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import CreateTestTypeModal from '@/components/admin/CreateTestTypeModal';
import SubmitTestModal from '@/components/admin/SubmitTestModal';
import TestTypeListModal from '@/components/admin/TestTypeListModal';
import EditTestTypeModal from '@/components/admin/EditTestTypeModal';
import FormProgress from '@/components/admin/submit-test/FormProgress';
import TestDetailsForm from '@/components/admin/submit-test/TestDetailsForm';
import CameraCapture from '@/components/admin/CameraCapture';
import { fieldAgentApi } from '@/lib/api/field-agent';

interface PatientInfo {
  lga: string;
  community: string;
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  phoneNumber: string;
  isExistingPatient?: boolean;
  patientId?: string;
}

interface TestDetails {
  testType: string;
  dateConducted: string;
  testResult: string;
  officerNote: string;
  testImage: File | null;
}

interface TestType {
  _id: string;
  name: string;
  results: string[];
}

interface CommunityOption {
  value: string;
  label: string;
  lga: string;
}

export default function TestRecordingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);

  // Communities and LGAs from API
  const [communities, setCommunities] = useState<CommunityOption[]>([]);
  const [lgas, setLgas] = useState<{ value: string; label: string }[]>([]);

  // Form State
  const [formData, setFormData] = useState<PatientInfo>({
    lga: '',
    community: '',
    firstName: '',
    lastName: '',
    age: '',
    gender: 'male',
    phoneNumber: '',
    isExistingPatient: false,
  });

  const [testDetails, setTestDetails] = useState<TestDetails>({
    testType: '',
    dateConducted: '',
    testResult: '',
    officerNote: '',
    testImage: null,
  });

  const [patientPhoto, setPatientPhoto] = useState<File | null>(null);
  const [testImagePreview, setTestImagePreview] = useState<string | null>(null);
  const [patientPhotoPreview, setPatientPhotoPreview] = useState<string | null>(null);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showCameraCapture, setShowCameraCapture] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'patient' | 'test' | null>(null);

  // Refs for file inputs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal States
  const [isCreateTestTypeModalOpen, setIsCreateTestTypeModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isTestTypeListModalOpen, setIsTestTypeListModalOpen] = useState(false);
  const [isEditTestTypeModalOpen, setIsEditTestTypeModalOpen] = useState(false);
  const [selectedTestType, setSelectedTestType] = useState<TestType | null>(null);

  // Test Types State
  const [testTypes, setTestTypes] = useState<TestType[]>([]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Validation State
  const [validationError, setValidationError] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({});

  // Phone number and name validation regex
  const PHONE_REGEX = /^[0-9+\-\s()]{10,15}$/;
  const NAME_REGEX = /^[a-zA-Z\s\-']+$/;

  // Fetch communities on mount
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fieldAgentApi.getMyCommunities();
      const communitiesData =
        (res.data as any)?.data?.communities || (res.data as any)?.communities || [];

      // Extract unique LGAs
      const uniqueLgas = [...new Set(communitiesData.map((c: any) => c.lga).filter(Boolean))] as string[];
      setLgas(uniqueLgas.map((lga) => ({ value: lga, label: lga })));

      const mappedCommunities = communitiesData.map((c: any) => ({
        value: c._id || c.id,
        label: c.name,
        lga: c.lga,
      }));
      setCommunities(mappedCommunities);
    } catch {
      // API error - show empty state
      setLgas([]);
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch test types from API
  useEffect(() => {
    const fetchTestTypes = async () => {
      try {
        const res = await fieldAgentApi.getTestTypes();
        if (res.success) {
          const testData = res.data as any;
          const testTypesArray = testData?.data?.testTypes || testData?.testTypes || [];
          const mapped = testTypesArray.map((t: any) => ({
            _id: t._id,
            name: t.name,
            results: t.allowedResults || t.results || [],
          }));
          setTestTypes(mapped);
        }
      } catch (err) {
        console.error('Error fetching test types:', err);
      }
    };
    fetchTestTypes();
  }, []);

  // Helper to get test type name from ID
  const getTestTypeName = useCallback((testTypeId: string): string => {
    const testType = testTypes.find(t => t._id === testTypeId);
    return testType?.name || testTypeId;
  }, [testTypes]);

  // Filter communities by selected LGA
  const filteredCommunities = formData.lga
    ? communities.filter((c) => c.lga === formData.lga)
    : communities;

  // Validation functions for each step
  // Validation functions for each step with detailed field-level errors
  const validateStep1 = (): { isValid: boolean; errors: Record<string, string | null>; firstError: string | null } => {
    const errors: Record<string, string | null> = {};
    
    // LGA validation removed - field agents use pre-assigned communities
    if (!formData.community) {
      errors.community = 'Please select a community';
    }
    if (!formData.firstName.trim()) {
      errors.firstName = 'Please enter patient first name';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    } else if (!NAME_REGEX.test(formData.firstName.trim())) {
      errors.firstName = 'First name can only contain letters';
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Please enter patient last name';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    } else if (!NAME_REGEX.test(formData.lastName.trim())) {
      errors.lastName = 'Last name can only contain letters';
    }
    if (!formData.age.trim()) {
      errors.age = 'Please enter patient age';
    } else {
      const age = parseInt(formData.age, 10);
      if (isNaN(age) || age < 0 || age > 150) {
        errors.age = 'Please enter a valid age (0-150)';
      }
    }
    if (!formData.gender) {
      errors.gender = 'Please select patient gender';
    }
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Please enter patient phone number';
    } else if (!PHONE_REGEX.test(formData.phoneNumber.trim())) {
      errors.phoneNumber = 'Please enter a valid phone number (10-15 digits)';
    }

    const errorMessages = Object.values(errors).filter(Boolean) as string[];
    return {
      isValid: errorMessages.length === 0,
      errors,
      firstError: errorMessages[0] || null,
    };
  };

  const validateStep2 = (): { isValid: boolean; errors: Record<string, string | null>; firstError: string | null } => {
    const errors: Record<string, string | null> = {};
    
    if (!testDetails.testType) {
      errors.testType = 'Please select a test type';
    }
    if (!testDetails.dateConducted) {
      errors.dateConducted = 'Please select the date conducted';
    } else {
      const date = new Date(testDetails.dateConducted);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (date > today) {
        errors.dateConducted = 'Date cannot be in the future';
      }
    }
    if (!testDetails.testResult) {
      errors.testResult = 'Please select a test result';
    }
    if (!testDetails.officerNote.trim()) {
      errors.officerNote = 'Please add an officer note';
    }
    if (!testDetails.testImage) {
      errors.testImage = 'Please upload a test image';
    } else {
      if (testDetails.testImage.size > 10 * 1024 * 1024) {
        errors.testImage = 'Test image must be less than 10MB';
      }
      if (!testDetails.testImage.type.startsWith('image/')) {
        errors.testImage = 'Test image must be an image file';
      }
    }

    const errorMessages = Object.values(errors).filter(Boolean) as string[];
    return {
      isValid: errorMessages.length === 0,
      errors,
      firstError: errorMessages[0] || null,
    };
  };

  const validateStep3 = (): { isValid: boolean; errors: Record<string, string | null>; firstError: string | null } => {
    const errors: Record<string, string | null> = {};
    
    if (!patientPhoto) {
      errors.patientPhoto = 'Please upload a patient photo';
    } else {
      if (patientPhoto.size > 10 * 1024 * 1024) {
        errors.patientPhoto = 'Photo size must be less than 10MB';
      }
      if (!patientPhoto.type.startsWith('image/')) {
        errors.patientPhoto = 'Please upload a valid image file';
      }
    }

    const errorMessages = Object.values(errors).filter(Boolean) as string[];
    return {
      isValid: errorMessages.length === 0,
      errors,
      firstError: errorMessages[0] || null,
    };
  };

  // Get current step validation result
  const getCurrentStepValidation = useCallback(() => {
    switch (currentStep) {
      case 1:
        return validateStep1();
      case 2:
        return validateStep2();
      case 3:
        return validateStep3();
      default:
        return { isValid: true, errors: {}, firstError: null };
    }
  }, [currentStep, formData, testDetails, patientPhoto]);

  // Check if current step is valid (for button disable state)
  const currentValidation = getCurrentStepValidation();
  const isCurrentStepValid = currentValidation.isValid;

  // Prevent form bypass via keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Enter key from navigating if form is invalid
      if (e.key === 'Enter' && !isCurrentStepValid && currentStep < 4) {
        e.preventDefault();
        e.stopPropagation();
      }
      // Prevent Ctrl+Enter / Cmd+Enter bypass
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !isCurrentStepValid) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isCurrentStepValid, currentStep]);

  // Navigation with validation
  const nextStep = () => {
    const validation = getCurrentStepValidation();
    
    // Touch all fields in current step to show errors
    const stepFields: Record<number, string[]> = {
      1: ['lga', 'community', 'firstName', 'lastName', 'age', 'gender', 'phoneNumber'],
      2: ['testType', 'dateConducted', 'testResult', 'officerNote', 'testImage'],
      3: ['patientPhoto'],
    };
    
    const fieldsToTouch = stepFields[currentStep] || [];
    const newTouched: Record<string, boolean> = {};
    fieldsToTouch.forEach((f) => { newTouched[f] = true; });
    setTouchedFields((prev) => ({ ...prev, ...newTouched }));
    setFieldErrors((prev) => ({ ...prev, ...validation.errors }));
    
    if (!validation.isValid) {
      setValidationError(validation.firstError);
      return;
    }
    
    setValidationError(null);
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const previousStep = () => {
    setValidationError(null);
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Mark field as touched (on blur)
  const handleFieldBlur = useCallback((fieldName: string) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
    
    // Update field error
    const validation = getCurrentStepValidation();
    setFieldErrors((prev) => ({ ...prev, [fieldName]: validation.errors[fieldName] || null }));
  }, [getCurrentStepValidation]);

  // Get field error for display
  const getFieldError = (fieldName: string): string | null => {
    return touchedFields[fieldName] ? fieldErrors[fieldName] || null : null;
  };

  // Get CSS classes based on validation state - use focus-within for parent div
  const getFieldClasses = (fieldName: string): string => {
    const error = getFieldError(fieldName);
    
    if (error) {
      return 'border-red-500 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-300 bg-red-50/30';
    }
    return 'border-[#d9d9d9] focus-within:border-[#2c7be5] focus-within:ring-2 focus-within:ring-[#2c7be5]/40';
  };

  // Handlers with validation error clearing
  const handlePatientInfoChange = (field: keyof PatientInfo, value: string) => {
    setValidationError(null);
    if (field === 'lga') {
      setFormData((prev) => ({ ...prev, lga: value, community: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
    
    // Clear field error when user starts typing
    if (touchedFields[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleTestDetailsChange = (field: keyof TestDetails, value: string) => {
    setValidationError(null);
    setTestDetails((prev) => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (touchedFields[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleTestImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setTestDetails((prev) => ({ ...prev, testImage: file }));
    setValidationError(null);
    setTouchedFields((prev) => ({ ...prev, testImage: true }));
    setFieldErrors((prev) => ({ ...prev, testImage: null }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTestImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePatientPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPatientPhoto(file);
    setValidationError(null);
    setFieldErrors((prev) => ({ ...prev, patientPhoto: null }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPatientPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Handle camera capture
  const handleCameraCapture = (file: File) => {
    if (cameraTarget === 'test') {
      setTestDetails((prev) => ({ ...prev, testImage: file }));
      setFieldErrors((prev) => ({ ...prev, testImage: null }));
      setTouchedFields((prev) => ({ ...prev, testImage: true }));
      const reader = new FileReader();
      reader.onloadend = () => setTestImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPatientPhoto(file);
      setFieldErrors((prev) => ({ ...prev, patientPhoto: null }));
      setTouchedFields((prev) => ({ ...prev, patientPhoto: true }));
      const reader = new FileReader();
      reader.onloadend = () => setPatientPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }

    setValidationError(null);
    setCameraTarget(null);
    setShowCameraCapture(false);
  };

  const fetchTestTypesRefresh = async () => {
    try {
      const res = await fieldAgentApi.getTestTypes();
      if (res.success) {
        const testData = res.data as any;
        const testTypesArray = testData?.data?.testTypes || testData?.testTypes || [];
        const mapped = testTypesArray.map((t: any) => ({
          _id: t._id,
          name: t.name,
          results: t.allowedResults || t.results || [],
        }));
        setTestTypes(mapped);
      }
    } catch (err) {
      console.error('Error refreshing test types:', err);
    }
  };

  const handleAddTestType = async (testType: string, expectedResults: string[]) => {
    try {
      await fieldAgentApi.createTestType({ name: testType, allowedResults: expectedResults });
      await fetchTestTypesRefresh();
    } catch (err) {
      console.error('Error creating test type:', err);
    }
  };

  const handleEditTestType = async (_id: string, testType: string, expectedResults: string[]) => {
    try {
      await fieldAgentApi.updateTestType(_id, { name: testType, allowedResults: expectedResults });
      await fetchTestTypesRefresh();
    } catch (err) {
      console.error('Error updating test type:', err);
    }
  };

  const handleDeleteTestType = async (_id: string) => {
    try {
      await fieldAgentApi.deleteTestType(_id);
      await fetchTestTypesRefresh();
    } catch (err) {
      console.error('Error deleting test type:', err);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Validate community is selected
      const communityId = formData.community;
      if (!communityId) {
        throw new Error('Please select a community');
      }

      // Validate patient info
      if (!formData.firstName?.trim()) {
        throw new Error('First name is required');
      }
      if (!formData.lastName?.trim()) {
        throw new Error('Last name is required');
      }
      if (!formData.gender) {
        throw new Error('Gender is required');
      }

      // Validate test details
      if (!testDetails.testType?.trim()) {
        throw new Error('Test type is required');
      }
      if (!testDetails.testResult?.trim()) {
        throw new Error('Test result is required');
      }
      if (!testDetails.dateConducted) {
        throw new Error('Date conducted is required');
      }

      // Create patient with test details in one request
      const result = await fieldAgentApi.createPatientWithTest({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        age: parseInt(formData.age) || 0,
        gender: formData.gender, // 'male' or 'female' (lowercase)
        phone: formData.phoneNumber?.trim() || '',
        community: communityId,
        testDetails: [{
          testType: testDetails.testType,
          testResult: testDetails.testResult,
          dateConducted: testDetails.dateConducted,
          officerNotes: testDetails.officerNote || '',
        }],
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to create patient and test record');
      }

      setSubmitSuccess(true);
      setIsSubmitModalOpen(false);

      // Reset form
      setFormData({
        lga: '',
        community: '',
        firstName: '',
        lastName: '',
        age: '',
        gender: 'male',
        phoneNumber: '',
        isExistingPatient: false,
      });
      setTestDetails({
        testType: '',
        dateConducted: '',
        testResult: '',
        officerNote: '',
        testImage: null,
      });
      setPatientPhoto(null);
      setTestImagePreview(null);
      setPatientPhotoPreview(null);
      setTouchedFields({});
      setFieldErrors({});
      setCurrentStep(1);

      // Auto-dismiss success message after 10 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 10000);

    } catch (err: any) {
      console.error('Submit error:', err);
      setSubmitError(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2c7be5]"></div>
      </div>
    );
  }

  return (
    <main className="bg-white border border-[#d9d9d9] border-r-0 rounded-bl-[20px] rounded-tl-[20px] w-full min-h-[calc(100vh-93px)] p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="h-12 sm:h-[50px] rounded-lg bg-gradient-to-r from-[#fff9e6] to-[#e8f1ff] border-2 border-[#fff9e6] flex items-center px-4 sm:px-5">
        <span className="text-base sm:text-xl font-semibold text-[#212b36] uppercase font-poppins">TEST RECORDING</span>
      </div>
      <div className="h-px bg-[#d9d9d9]" />

      {/* Success Message */}
      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>Test record submitted successfully!</span>
          <button onClick={() => setSubmitSuccess(false)} className="text-green-700 hover:text-green-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Error Message */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{submitError}</span>
          <button onClick={() => setSubmitError(null)} className="text-red-700 hover:text-red-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Validation Error Message */}
      {validationError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{validationError}</span>
          <button onClick={() => setValidationError(null)} className="text-amber-700 hover:text-amber-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Form Card */}
      <div className="flex justify-center">
        <div className="w-full max-w-[768px] rounded-lg bg-white border border-[#d9d9d9] overflow-hidden p-6">
          <FormProgress currentStep={currentStep} />

          <div className="max-w-[517px] mx-auto">
            <h2 className="text-xl font-medium text-[#212b36] font-poppins mb-6">
              {currentStep === 1 && 'Patient Info'}
              {currentStep === 2 && 'Test Details'}
              {currentStep === 3 && 'Upload photo/attachment'}
              {currentStep === 4 && 'Summary'}
            </h2>

            {/* Step 1: Patient Info */}
            {currentStep === 1 && (
              <div className="flex flex-col gap-[26px]">
                {/* LGA */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#637381] font-poppins">LGA</label>
                  <div className={`relative h-12 rounded bg-white border ${getFieldClasses('lga')}`}>
                    <select
                      value={formData.lga}
                      onChange={(e) => handlePatientInfoChange('lga', e.target.value)}
                      onBlur={() => handleFieldBlur('lga')}
                      className="w-full h-full px-[22px] bg-transparent text-[#212b36] font-poppins appearance-none focus:outline-none cursor-pointer"
                    >
                      <option value="">Select LGA</option>
                      {lgas.map((lga) => (
                        <option key={lga.value} value={lga.value}>
                          {lga.label}
                        </option>
                      ))}
                    </select>
                    <svg className="absolute top-1/2 right-[10px] -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {getFieldError('lga') && (
                    <p className="text-sm text-red-500 font-poppins flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {getFieldError('lga')}
                    </p>
                  )}
                </div>

                {/* Community */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#637381] font-poppins">Select Community</label>
                  <div className={`relative h-12 rounded bg-white border ${getFieldClasses('community')}`}>
                    <select
                      value={formData.community}
                      onChange={(e) => handlePatientInfoChange('community', e.target.value)}
                      onBlur={() => handleFieldBlur('community')}
                      className="w-full h-full px-[22px] bg-transparent text-[#212b36] font-poppins appearance-none focus:outline-none cursor-pointer"
                    >
                      <option value="">Select Community</option>
                      {filteredCommunities.map((community) => (
                        <option key={community.value} value={community.value}>
                          {community.label}
                        </option>
                      ))}
                    </select>
                    <svg className="absolute top-1/2 right-[10px] -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {getFieldError('community') && (
                    <p className="text-sm text-red-500 font-poppins flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {getFieldError('community')}
                    </p>
                  )}
                </div>

                {/* First Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#637381] font-poppins">First Name</label>
                  <div className={`h-12 rounded bg-white border ${getFieldClasses('firstName')}`}>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handlePatientInfoChange('firstName', e.target.value)}
                      onBlur={() => handleFieldBlur('firstName')}
                      placeholder="Tayo"
                      className="w-full h-full px-[22px] bg-transparent text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none cursor-text"
                    />
                  </div>
                  {getFieldError('firstName') && (
                    <p className="text-sm text-red-500 font-poppins flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {getFieldError('firstName')}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#637381] font-poppins">Last Name</label>
                  <div className={`h-12 rounded bg-white border ${getFieldClasses('lastName')}`}>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handlePatientInfoChange('lastName', e.target.value)}
                      onBlur={() => handleFieldBlur('lastName')}
                      placeholder="Ayo"
                      className="w-full h-full px-[22px] bg-transparent text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none cursor-text"
                    />
                  </div>
                  {getFieldError('lastName') && (
                    <p className="text-sm text-red-500 font-poppins flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {getFieldError('lastName')}
                    </p>
                  )}
                </div>

                {/* Age */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#637381] font-poppins">Age</label>
                  <div className={`h-12 rounded bg-white border ${getFieldClasses('age')}`}>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => handlePatientInfoChange('age', e.target.value)}
                      onBlur={() => handleFieldBlur('age')}
                      placeholder="67"
                      min="0"
                      max="150"
                      className="w-full h-full px-[22px] bg-transparent text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none cursor-text"
                    />
                  </div>
                  {getFieldError('age') && (
                    <p className="text-sm text-red-500 font-poppins flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {getFieldError('age')}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#637381] font-poppins">Gender</label>
                  <div className={`relative h-12 rounded bg-white border ${getFieldClasses('gender')}`}>
                    <select
                      value={formData.gender}
                      onChange={(e) => handlePatientInfoChange('gender', e.target.value)}
                      onBlur={() => handleFieldBlur('gender')}
                      className="w-full h-full px-[22px] bg-transparent text-[#212b36] font-poppins appearance-none focus:outline-none cursor-pointer"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    <svg className="absolute top-1/2 right-[10px] -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  {getFieldError('gender') && (
                    <p className="text-sm text-red-500 font-poppins flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {getFieldError('gender')}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#637381] font-poppins">Phone Number</label>
                  <div className={`h-12 rounded bg-white border ${getFieldClasses('phoneNumber')}`}>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handlePatientInfoChange('phoneNumber', e.target.value)}
                      onBlur={() => handleFieldBlur('phoneNumber')}
                      placeholder="080537736267"
                      className="w-full h-full px-[22px] bg-transparent text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none cursor-text"
                    />
                  </div>
                  {getFieldError('phoneNumber') && (
                    <p className="text-sm text-red-500 font-poppins flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {getFieldError('phoneNumber')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Test Details */}
            {currentStep === 2 && (
              <TestDetailsForm
                testDetails={testDetails}
                onChange={handleTestDetailsChange}
                onImageChange={handleTestImageChange}
                onOpenCameraCapture={() => {
                  setCameraTarget('test');
                  setShowCameraCapture(true);
                }}
                onBlur={handleFieldBlur}
                errors={fieldErrors}
                touched={touchedFields}
                testTypes={testTypes}
              />
            )}

            {/* Step 3: Upload Photos */}
            {currentStep === 3 && (
              <div className="flex flex-col gap-[26px]">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#637381] font-poppins">Patient photo</label>
                  {/* Hidden file inputs */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePatientPhotoChange}
                    className="hidden"
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePatientPhotoChange}
                    className="hidden"
                  />

                  {/* Upload box with dashed border */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                      className={`w-full h-[140px] rounded bg-white border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer ${
                        getFieldError('patientPhoto') 
                          ? 'border-red-500 bg-red-50/30 hover:border-red-600' 
                          : patientPhoto 
                            ? 'border-green-500 bg-green-50/30 hover:border-green-600'
                            : 'border-[#d9d9d9] hover:border-[#2c7be5] hover:bg-blue-50/30'
                      }`}
                    >
                      {patientPhoto ? (
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-green-600 text-base font-normal font-poppins">Photo uploaded</span>
                        </div>
                      ) : (
                        <span className="text-[#637381] text-base font-normal font-poppins">Upload Patient Image</span>
                      )}
                    </button>

                    {/* Upload Options Popup */}
                    {showPhotoOptions && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowPhotoOptions(false)}
                        />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-56 bg-white rounded-lg shadow-lg border border-[#d9d9d9] z-50 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => {
                              setShowPhotoOptions(false);
                              setCameraTarget('patient');
                              setShowCameraCapture(true);
                            }}
                            className="w-full px-4 py-3 text-left text-[#212b36] text-base font-poppins hover:bg-gray-50 transition-colors border-b border-[#d9d9d9]"
                          >
                            Take photo
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowPhotoOptions(false);
                              fileInputRef.current?.click();
                            }}
                            className="w-full px-4 py-3 text-left text-[#212b36] text-base font-poppins hover:bg-gray-50 transition-colors"
                          >
                            Choose existing photo
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {getFieldError('patientPhoto') && (
                    <p className="text-sm text-red-500 font-poppins flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {getFieldError('patientPhoto')}
                    </p>
                  )}

                  {patientPhoto && (
                    <p className="mt-1 text-sm text-green-600 font-poppins flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Selected: {patientPhoto.name}
                    </p>
                  )}
                </div>
                {patientPhotoPreview && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#637381] font-poppins">Patient Photo Preview</label>
                    <img src={patientPhotoPreview} alt="Patient" className="max-w-[300px] rounded border border-green-500" />
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Summary */}
            {currentStep === 4 && (
              <div className="flex flex-col gap-6">
                {/* Patient Info Section */}
                <div className="flex flex-col gap-4">
                  <div className="h-8 bg-[#ecf4ff] rounded px-3 flex items-center">
                    <span className="text-sm font-medium text-[#2c7be5] font-poppins">Patient Info</span>
                  </div>

                  {/* LGA */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#637381] font-poppins">LGA</label>
                    <div className="h-12 rounded bg-white border border-[#d9d9d9] flex items-center px-[22px]">
                      <span className="text-[#212b36] font-poppins text-sm">{formData.lga || '-'}</span>
                    </div>
                  </div>

                  {/* Select Community */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#637381] font-poppins">Select Community</label>
                    <div className="h-12 rounded bg-white border border-[#d9d9d9] flex items-center px-[22px]">
                      <span className="text-[#212b36] font-poppins text-sm">{filteredCommunities.find(c => c.value === formData.community)?.label || '-'}</span>
                    </div>
                  </div>

                  {/* First Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#637381] font-poppins">First Name</label>
                    <div className="h-12 rounded bg-white border border-[#d9d9d9] flex items-center px-[22px]">
                      <span className="text-[#212b36] font-poppins text-sm">{formData.firstName || '-'}</span>
                    </div>
                  </div>

                  {/* Last Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#637381] font-poppins">Last Name</label>
                    <div className="h-12 rounded bg-white border border-[#d9d9d9] flex items-center px-[22px]">
                      <span className="text-[#212b36] font-poppins text-sm">{formData.lastName || '-'}</span>
                    </div>
                  </div>

                  {/* Age */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#637381] font-poppins">Age</label>
                    <div className="h-12 rounded bg-white border border-[#d9d9d9] flex items-center px-[22px]">
                      <span className="text-[#212b36] font-poppins text-sm">{formData.age || '-'}</span>
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#637381] font-poppins">Gender</label>
                    <div className="h-12 rounded bg-white border border-[#d9d9d9] flex items-center px-[22px]">
                      <span className="text-[#212b36] font-poppins text-sm capitalize">{formData.gender || '-'}</span>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#637381] font-poppins">Phone Number</label>
                    <div className="h-12 rounded bg-white border border-[#d9d9d9] flex items-center px-[22px]">
                      <span className="text-[#212b36] font-poppins text-sm">{formData.phoneNumber || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Test Details Section */}
                <div className="flex flex-col gap-4">
                  <div className="h-8 bg-[#ecf4ff] rounded px-3 flex items-center">
                    <span className="text-sm font-medium text-[#2c7be5] font-poppins">Test Details</span>
                  </div>

                  {/* Test Type */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#637381] font-poppins">Test Type</label>
                    <div className="h-12 rounded bg-white border border-[#d9d9d9] flex items-center px-[22px]">
                      <span className="text-[#212b36] font-poppins text-sm">{testDetails.testType ? getTestTypeName(testDetails.testType) : '-'}</span>
                    </div>
                  </div>

                  {/* Date Conducted */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#637381] font-poppins">Date Conducted</label>
                    <div className="h-12 rounded bg-white border border-[#d9d9d9] flex items-center px-[22px]">
                      <span className="text-[#212b36] font-poppins text-sm">{testDetails.dateConducted || '-'}</span>
                    </div>
                  </div>

                  {/* Test Result */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#637381] font-poppins">Test Result</label>
                    <div className="h-12 rounded bg-white border border-[#d9d9d9] flex items-center px-[22px]">
                      <span className="text-[#212b36] font-poppins text-sm">{testDetails.testResult || '-'}</span>
                    </div>
                  </div>

                  {/* Officer Note */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#637381] font-poppins">Officer Note</label>
                    <div className="min-h-[80px] rounded bg-white border border-[#d9d9d9] flex items-start p-[22px]">
                      <span className="text-[#212b36] font-poppins text-sm">{testDetails.officerNote || '-'}</span>
                    </div>
                  </div>

                  {/* Attachments */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-[#637381] font-poppins">Test image</label>
                      {testImagePreview ? (
                        <div className="w-full max-w-[200px] h-[130px] rounded border border-[#d9d9d9] overflow-hidden relative">
                          <img src={testImagePreview} alt="Test" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              setTestDetails(prev => ({ ...prev, testImage: null }));
                              setTestImagePreview(null);
                            }}
                            className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-100"
                          >
                            <svg className="w-3.5 h-3.5 text-[#637381]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="h-12 rounded bg-white border border-[#d9d9d9] flex items-center px-[22px]">
                          <span className="text-[#637381] font-poppins text-sm">No image uploaded</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-[#637381] font-poppins">Patient photo</label>
                      {patientPhotoPreview ? (
                        <div className="w-full max-w-[200px] h-[130px] rounded border border-[#d9d9d9] overflow-hidden">
                          <img src={patientPhotoPreview} alt="Patient" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-12 rounded bg-white border border-[#d9d9d9] flex items-center px-[22px]">
                          <span className="text-[#637381] font-poppins text-sm">No photo uploaded</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons - Back on left, Next on right per Figma */}
          <div className="flex justify-between items-center mt-8">
            {currentStep > 1 ? (
              <button
                onClick={previousStep}
                className="h-12 px-6 rounded-[10px] bg-white border border-[#2c7be5] text-[#2c7be5] font-medium font-inter hover:bg-blue-50 transition-colors cursor-pointer"
              >
                Back
              </button>
            ) : (
              <div />
            )}
            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                disabled={!isCurrentStepValid}
                className={`h-12 px-6 rounded-[10px] font-medium font-inter transition-colors ${
                  isCurrentStepValid
                    ? 'bg-[#2c7be5] text-white hover:bg-blue-600 cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                disabled={isSubmitting}
                className="h-12 px-6 rounded-[10px] bg-[#2c7be5] text-white font-medium font-inter hover:bg-blue-600 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Camera Capture Modal */}
      <CameraCapture
        isOpen={showCameraCapture}
        onClose={() => {
          setShowCameraCapture(false);
          setCameraTarget(null);
        }}
        onCapture={handleCameraCapture}
      />

      {/* Modals */}
      <CreateTestTypeModal
        isOpen={isCreateTestTypeModalOpen}
        onClose={() => setIsCreateTestTypeModalOpen(false)}
        onAdd={handleAddTestType}
      />
      <TestTypeListModal
        isOpen={isTestTypeListModalOpen}
        onClose={() => setIsTestTypeListModalOpen(false)}
        testTypes={testTypes}
        onEdit={(testType) => {
          setSelectedTestType(testType);
          setIsEditTestTypeModalOpen(true);
        }}
        onDelete={handleDeleteTestType}
      />
      <EditTestTypeModal
        isOpen={isEditTestTypeModalOpen}
        onClose={() => setIsEditTestTypeModalOpen(false)}
        testType={selectedTestType}
        onSave={handleEditTestType}
      />
      <SubmitTestModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={handleSubmit}
      />
    </main>
  );
}
