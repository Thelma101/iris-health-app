'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import CreateTestTypeModal from '@/components/admin/CreateTestTypeModal';
import SubmitTestModal from '@/components/admin/SubmitTestModal';
import TestTypeListModal from '@/components/admin/TestTypeListModal';
import EditTestTypeModal from '@/components/admin/EditTestTypeModal';
import FormProgress from '@/components/admin/submit-test/FormProgress';
import PatientInfoForm from '@/components/admin/submit-test/PatientInfoForm';
import TestDetailsForm from '@/components/admin/submit-test/TestDetailsForm';
import CameraCapture from '@/components/admin/CameraCapture';
import api from '@/lib/api/index';

interface PatientInfo {
  lga: string;
  community: string;
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  phoneNumber: string;
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

export default function SubmitTestPage() {
  const [currentStep, setCurrentStep] = useState(1);

  // Communities and LGAs from API
  const [communities, setCommunities] = useState<CommunityOption[]>([]);
  const [lgas, setLgas] = useState<{ value: string; label: string }[]>([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);

  // Form State
  const [formData, setFormData] = useState<PatientInfo>({
    lga: '',
    community: '',
    firstName: '',
    lastName: '',
    age: '',
    gender: 'male',
    phoneNumber: '',
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
  const [cameraTarget, setCameraTarget] = useState<'test' | 'patient'>('patient');

  // Refs for file inputs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal States
  const [isCreateTestTypeModalOpen, setIsCreateTestTypeModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isTestTypeListModalOpen, setIsTestTypeListModalOpen] = useState(false);
  const [isEditTestTypeModalOpen, setIsEditTestTypeModalOpen] = useState(false);
  const [selectedTestType, setSelectedTestType] = useState<TestType | null>(null);

  // Test Types State - start empty, no dummy data
  const [testTypes, setTestTypes] = useState<TestType[]>([]);
  const [testTypesLoading, setTestTypesLoading] = useState(true);

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

  // Validation functions for each step
  const validateStep1 = useCallback((): { isValid: boolean; errors: Record<string, string | null>; firstError: string | null } => {
    const errors: Record<string, string | null> = {};
    
    if (!formData.lga) {
      errors.lga = 'Please select an LGA';
    }
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
  }, [formData]);

  const validateStep2 = useCallback((): { isValid: boolean; errors: Record<string, string | null>; firstError: string | null } => {
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
        errors.testImage = 'Photo size must be less than 10MB';
      }
      if (!testDetails.testImage.type.startsWith('image/')) {
        errors.testImage = 'Please upload a valid image file';
      }
    }

    const errorMessages = Object.values(errors).filter(Boolean) as string[];
    return {
      isValid: errorMessages.length === 0,
      errors,
      firstError: errorMessages[0] || null,
    };
  }, [testDetails]);

  const validateStep3 = useCallback((): { isValid: boolean; errors: Record<string, string | null>; firstError: string | null } => {
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
  }, [patientPhoto]);

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
  }, [currentStep, validateStep1, validateStep2, validateStep3]);

  // Check if current step is valid (for button disable state)
  const isCurrentStepValid = getCurrentStepValidation().isValid;

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
    
    // Update field error based on current step validation
    const validation = getCurrentStepValidation();
    setFieldErrors((prev) => ({ ...prev, [fieldName]: validation.errors[fieldName] || null }));
  }, [getCurrentStepValidation]);

  // Fetch communities on mount
  const fetchCommunities = useCallback(async () => {
    setLoadingCommunities(true);
    try {
      const res = await api.getCommunities();
      // Access data from ApiResponse wrapper, then extract communities array
      const communitiesData = (res.data as any)?.communities || [];

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
      setLoadingCommunities(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  // Fetch test types from API
  const fetchTestTypes = useCallback(async () => {
    setTestTypesLoading(true);
    try {
      const res = await api.getTestTypes();
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
    } finally {
      setTestTypesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestTypes();
  }, [fetchTestTypes]);

  // Helper to get test type name from ID
  const getTestTypeName = useCallback((testTypeId: string): string => {
    const testType = testTypes.find(t => t._id === testTypeId);
    return testType?.name || testTypeId;
  }, [testTypes]);

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
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPatientPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Handle camera capture - supports both test image and patient photo
  const handleCameraCapture = (file: File) => {
    if (cameraTarget === 'test') {
      setTestDetails((prev) => ({ ...prev, testImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => setTestImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPatientPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPatientPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Open camera for test image (step 2)
  const handleOpenTestImageCamera = () => {
    setCameraTarget('test');
    setShowCameraCapture(true);
  };

  const handleAddTestType = () => {
    // CreateTestTypeModal now handles API call directly.
    // Just re-fetch to get the latest list with real IDs.
    fetchTestTypes();
  };

  const handleEditTestType = async (_id: string, testType: string, expectedResults: string[]) => {
    try {
      const res = await api.updateTestType(_id, { name: testType, allowedResults: expectedResults });
      if (res.success) {
        fetchTestTypes();
      }
    } catch (err) {
      console.error('Error updating test type:', err);
    }
  };

  const handleDeleteTestType = async (_id: string) => {
    try {
      const res = await api.deleteTestType(_id);
      if (res.success) {
        fetchTestTypes();
      }
    } catch (err) {
      console.error('Error deleting test type:', err);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    // Validate required patient info fields
    if (!formData.firstName?.trim()) {
      setSubmitError('Please enter patient first name');
      setIsSubmitting(false);
      return;
    }
    if (!formData.lastName?.trim()) {
      setSubmitError('Please enter patient last name');
      setIsSubmitting(false);
      return;
    }
    if (!formData.phoneNumber?.trim()) {
      setSubmitError('Please enter patient phone number');
      setIsSubmitting(false);
      return;
    }
    if (!formData.community) {
      setSubmitError('Please select a community');
      setIsSubmitting(false);
      return;
    }
    if (!testDetails.dateConducted) {
      setSubmitError('Please enter the date the test was conducted');
      setIsSubmitting(false);
      return;
    }
    if (!testDetails.testType) {
      setSubmitError('Please select a test type');
      setIsSubmitting(false);
      return;
    }
    if (!testDetails.testResult) {
      setSubmitError('Please select a test result');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Prepare payload for API - community should be the ObjectId
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phoneNumber.trim(),
        age: formData.age ? parseInt(formData.age, 10) : undefined,
        gender: formData.gender,
        community: formData.community, // This should be the community _id
        testDetails: [
          {
            testType: testDetails.testType,
            dateConducted: testDetails.dateConducted,
            testResult: testDetails.testResult,
            officerNote: testDetails.officerNote || undefined,
          },
        ],
      };
      
      
      const res = await api.createPatient(payload);
      
      if (res.success) {
        setSubmitSuccess(true);
        setIsSubmitModalOpen(false);
        
        // Reset form after successful submission
        setCurrentStep(1);
        setFormData({
          lga: '',
          community: '',
          firstName: '',
          lastName: '',
          age: '',
          gender: 'male',
          phoneNumber: '',
        });
        setTestDetails({
          testType: '',
          dateConducted: new Date().toISOString().split('T')[0],
          testResult: '',
          officerNote: '',
          testImage: null,
        });
        setPatientPhoto(null);
        setPatientPhotoPreview(null);
        setTestImagePreview(null);
        setTouchedFields({});
        setFieldErrors({});
        
        // Auto-dismiss success message after 10 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 10000);
      } else {
        setSubmitError(res.error || 'Submission failed');
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      setSubmitError(err.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-white border border-[#d9d9d9] border-r-0 rounded-bl-[20px] rounded-tl-[20px] w-full min-h-[calc(100vh-93px)] p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="h-12 sm:h-[50px] rounded-lg bg-gradient-to-r from-[#fff9e6] to-[#e8f1ff] border-2 border-[#fff9e6] flex items-center px-4 sm:px-5">
        <span className="text-base sm:text-xl font-semibold text-[#212b36] uppercase font-poppins">TEST RECORDING</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <button
          onClick={() => {
            setIsCreateTestTypeModalOpen(true);
          }}
          className="h-12 w-full sm:w-auto px-4 sm:px-6 rounded-[10px] bg-white border border-[#2c7be5] text-[#2c7be5] font-medium font-inter hover:bg-blue-50 transition-colors cursor-pointer whitespace-nowrap text-xs sm:text-sm md:text-base"
        >
          Create New Test Type
        </button>
        <button
          onClick={() => {
            setIsTestTypeListModalOpen(true);
          }}
          className="h-12 w-full sm:w-auto px-4 sm:px-6 rounded-[10px] bg-white border border-[#2c7be5] text-[#2c7be5] font-medium font-inter hover:bg-blue-50 transition-colors cursor-pointer whitespace-nowrap text-xs sm:text-sm md:text-base"
        >
          View All Test Types
        </button>
      </div>
      <div className="h-px bg-[#d9d9d9]" />

      {/* Validation Error Message */}
      {validationError && (
        <div className="flex justify-center">
          <div className="w-full max-w-[768px] bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg flex items-center justify-between">
            <span>{validationError}</span>
            <button onClick={() => setValidationError(null)} className="text-amber-700 hover:text-amber-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

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
            {currentStep === 1 && (
              <PatientInfoForm
                formData={formData}
                onChange={handlePatientInfoChange}
                communities={communities}
                lgas={lgas}
                loading={loadingCommunities}
                onBlur={handleFieldBlur}
                errors={fieldErrors}
                touched={touchedFields}
              />
            )}
            {currentStep === 2 && (
              <TestDetailsForm 
                testDetails={testDetails} 
                onChange={handleTestDetailsChange} 
                onImageChange={handleTestImageChange}
                onOpenCameraCapture={handleOpenTestImageCamera}
                onBlur={handleFieldBlur}
                errors={fieldErrors}
                touched={touchedFields}
                testTypes={testTypes}
                testTypesLoading={testTypesLoading}
              />
            )}
            {currentStep === 3 && (
              <div className="flex flex-col gap-[26px]">
                {testImagePreview && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#637381] font-poppins">Test Image Preview</label>
                    <img src={testImagePreview} alt="Test" className="max-w-[300px] rounded border border-[#d9d9d9]" />
                  </div>
                )}
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
                      className="w-full h-[140px] rounded bg-white border-2 border-dashed border-[#2c7be5] flex flex-col items-center justify-center gap-2 hover:bg-blue-50/30 transition-colors cursor-pointer"
                    >
                      {/* Camera Icon */}
                      <svg className="w-12 h-12 text-[#2c7be5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-[#2c7be5] text-base font-medium font-poppins">Upload</span>
                    </button>

                    {/* Upload Options Popup - inside the box area */}
                    {showPhotoOptions && (
                      <>
                        {/* Backdrop to close popup */}
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowPhotoOptions(false)}
                        />
                        {/* Options menu - positioned at bottom center */}
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

                  {fieldErrors.patientPhoto && touchedFields.patientPhoto && (
                    <p className="text-sm text-red-500 font-poppins flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {fieldErrors.patientPhoto}
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
                    <img src={patientPhotoPreview} alt="Patient" className="max-w-[300px] rounded border border-[#d9d9d9]" />
                  </div>
                )}
              </div>
            )}
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
                      <span className="text-[#212b36] font-poppins text-sm">
                        {communities.find(c => c.value === formData.community)?.label || formData.community || '-'}
                      </span>
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
                    <div className="min-h-20 rounded bg-white border border-[#d9d9d9] flex items-start p-[22px]">
                      <span className="text-[#212b36] font-poppins text-sm">{testDetails.officerNote || '-'}</span>
                    </div>
                  </div>

                  {/* Test Sheet - inside Test Details section */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#637381] font-poppins">Test Sheet</label>
                    {testImagePreview ? (
                      <img 
                        src={testImagePreview} 
                        alt="Test" 
                        className="w-full max-w-[250px] rounded border border-[#d9d9d9] object-cover"
                      />
                    ) : (
                      <div className="h-32 max-w-[250px] rounded bg-gray-100 border border-[#d9d9d9] flex items-center justify-center">
                        <span className="text-[#637381] text-sm font-poppins">No image uploaded</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Patient Image Section */}
                <div className="flex flex-col gap-4">
                  <div className="h-8 bg-[#ecf4ff] rounded px-3 flex items-center">
                    <span className="text-sm font-medium text-[#2c7be5] font-poppins">Patient Image</span>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    {patientPhotoPreview ? (
                      <img 
                        src={patientPhotoPreview} 
                        alt="Patient" 
                        className="w-full max-w-[250px] rounded border border-[#d9d9d9] object-cover"
                      />
                    ) : (
                      <div className="h-32 max-w-[250px] rounded bg-gray-100 border border-[#d9d9d9] flex items-center justify-center">
                        <span className="text-[#637381] text-sm font-poppins">No photo uploaded</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
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

      {/* Camera Capture Modal */}
      <CameraCapture
        isOpen={showCameraCapture}
        onClose={() => setShowCameraCapture(false)}
        onCapture={handleCameraCapture}
      />
      
      {/* Error Toast */}
      {submitError && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">{submitError}</span>
          <button onClick={() => setSubmitError(null)} className="ml-2 hover:opacity-80">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Success Toast */}
      {submitSuccess && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3">
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">Test recording submitted successfully!</span>
          <button onClick={() => setSubmitSuccess(false)} className="ml-2 hover:opacity-80">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </main>
  );
}
