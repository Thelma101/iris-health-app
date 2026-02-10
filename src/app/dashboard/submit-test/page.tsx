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
import { calculateBMI, classifyBloodPressure } from '@/lib/utils/bmiCalculator';

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
  // Health metrics
  heightCm: string;
  weightKg: string;
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  glucoseLevel: string;
  glucoseUnit: string;
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

  // Patient mode: 'new' or 'existing'
  const [patientMode, setPatientMode] = useState<'new' | 'existing'>('new');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedPatientDisplay, setSelectedPatientDisplay] = useState<string>('');
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [patientSearchResults, setPatientSearchResults] = useState<any[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const patientDropdownRef = useRef<HTMLDivElement>(null);

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
    heightCm: '',
    weightKg: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    glucoseLevel: '',
    glucoseUnit: 'mg/dL',
  });

  const [patientPhoto, setPatientPhoto] = useState<File | null>(null);
  const [testImagePreview, setTestImagePreview] = useState<string | null>(null);
  const [showCameraCapture, setShowCameraCapture] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<'test' | 'patient'>('test');

  // Refs for file inputs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal States
  const [isCreateTestTypeModalOpen, setIsCreateTestTypeModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isTestTypeListModalOpen, setIsTestTypeListModalOpen] = useState(false);
  const [isEditTestTypeModalOpen, setIsEditTestTypeModalOpen] = useState(false);
  const [selectedTestType, setSelectedTestType] = useState<TestType | null>(null);

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
    
    // Existing patient mode — just need a patient selected
    if (patientMode === 'existing') {
      if (!selectedPatientId) {
        errors.patient = 'Please select an existing patient';
      }
      const errorMessages = Object.values(errors).filter(Boolean) as string[];
      return { isValid: errorMessages.length === 0, errors, firstError: errorMessages[0] || null };
    }
    
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
  }, [formData, patientMode, selectedPatientId]);

  const validateStep2 = useCallback((): { isValid: boolean; errors: Record<string, string | null>; firstError: string | null } => {
    // Health details step - all optional
    return { isValid: true, errors: {}, firstError: null };
  }, []);

  const validateStep3 = useCallback((): { isValid: boolean; errors: Record<string, string | null>; firstError: string | null } => {
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
    if (!testDetails.officerNote.trim()) {
      errors.officerNote = 'Please add an officer note';
    }

    const errorMessages = Object.values(errors).filter(Boolean) as string[];
    return {
      isValid: errorMessages.length === 0,
      errors,
      firstError: errorMessages[0] || null,
    };
  }, [testDetails]);

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
      2: [],
      3: ['testType', 'dateConducted', 'officerNote'],
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

  // Search existing patients (debounced by community filter)
  const searchExistingPatients = useCallback(async (query: string, communityId?: string) => {
    if (!query.trim() && !communityId) {
      setPatientSearchResults([]);
      return;
    }
    setLoadingPatients(true);
    try {
      const params: any = { limit: 20 };
      if (communityId) params.community = communityId;
      if (query.trim()) params.search = query.trim();
      const res = await api.getPatients(params);
      if (res.success) {
        const data = res.data as any;
        const patients = data?.patients || data?.data?.patients || [];
        setPatientSearchResults(patients);
      }
    } catch {
      setPatientSearchResults([]);
    } finally {
      setLoadingPatients(false);
    }
  }, []);

  // Debounce patient search
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (patientMode !== 'existing') return;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      searchExistingPatients(patientSearchQuery, formData.community || undefined);
    }, 300);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [patientSearchQuery, formData.community, patientMode, searchExistingPatients]);

  // Close patient dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (patientDropdownRef.current && !patientDropdownRef.current.contains(e.target as Node)) {
        setShowPatientDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Select an existing patient
  const handleSelectPatient = (patient: any) => {
    setSelectedPatientId(patient._id);
    const displayName = `${patient.firstName} ${patient.lastName}`;
    setSelectedPatientDisplay(displayName);
    setPatientSearchQuery(displayName);
    setShowPatientDropdown(false);

    // Populate form data from patient (read-only display)
    const communityId = patient.community?._id || patient.community;
    const communityObj = communities.find(c => c.value === communityId);
    setFormData({
      lga: communityObj?.lga || patient.lga || '',
      community: communityId || '',
      firstName: patient.firstName || '',
      lastName: patient.lastName || '',
      age: patient.age ? String(patient.age) : '',
      gender: patient.gender || 'male',
      phoneNumber: patient.phone || '',
    });
  };

  // Reset patient mode
  const handleModeChange = (mode: 'new' | 'existing') => {
    setPatientMode(mode);
    setSelectedPatientId('');
    setSelectedPatientDisplay('');
    setPatientSearchQuery('');
    setPatientSearchResults([]);
    setShowPatientDropdown(false);
    setFormData({ lga: '', community: '', firstName: '', lastName: '', age: '', gender: 'male', phoneNumber: '' });
    setTouchedFields({});
    setFieldErrors({});
    setValidationError(null);
    setCurrentStep(1);
  };

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

  // Handle camera capture
  const handleCameraCapture = (file: File) => {
    setTestDetails((prev) => ({ ...prev, testImage: file }));
    const reader = new FileReader();
    reader.onloadend = () => setTestImagePreview(reader.result as string);
    reader.readAsDataURL(file);
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

    // Common test validation
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

    const testPayload = {
      testType: testDetails.testType,
      dateConducted: testDetails.dateConducted,
      testResult: testDetails.testResult || undefined,
      officerNotes: testDetails.officerNote || undefined,
      heightCm: testDetails.heightCm ? parseFloat(testDetails.heightCm) : undefined,
      weightKg: testDetails.weightKg ? parseFloat(testDetails.weightKg) : undefined,
      bloodPressureSystolic: testDetails.bloodPressureSystolic ? parseInt(testDetails.bloodPressureSystolic, 10) : undefined,
      bloodPressureDiastolic: testDetails.bloodPressureDiastolic ? parseInt(testDetails.bloodPressureDiastolic, 10) : undefined,
      glucoseLevel: testDetails.glucoseLevel ? parseFloat(testDetails.glucoseLevel) : undefined,
      glucoseUnit: testDetails.glucoseUnit || 'mg/dL',
    };
    
    try {
      let res;

      if (patientMode === 'existing' && selectedPatientId) {
        // Add test to existing patient
        res = await api.addTestToPatient(selectedPatientId, { testDetails: [testPayload] });
      } else {
        // Create new patient with test
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

        const payload = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phoneNumber.trim(),
          age: formData.age ? parseInt(formData.age, 10) : undefined,
          gender: formData.gender,
          community: formData.community,
          testDetails: [testPayload],
        };
        
        res = await api.createPatientWithTest(payload);
      }
      
      if (res.success) {
        setSubmitSuccess(true);
        setIsSubmitModalOpen(false);
        
        // Reset form after successful submission
        setCurrentStep(1);
        setPatientMode('new');
        setSelectedPatientId('');
        setSelectedPatientDisplay('');
        setPatientSearchQuery('');
        setPatientSearchResults([]);
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
          heightCm: '',
          weightKg: '',
          bloodPressureSystolic: '',
          bloodPressureDiastolic: '',
          glucoseLevel: '',
          glucoseUnit: 'mg/dL',
        });
        setPatientPhoto(null);
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
        <div className="w-full max-w-[768px] rounded-lg bg-white border border-[#d9d9d9] p-6">
          <FormProgress currentStep={currentStep} stepLabels={['Patient\ninfo', 'Health Details', 'Test Type\nDetails', 'Submit']} />
          <div className="max-w-[517px] mx-auto">
            <h2 className="text-xl font-medium text-[#212b36] font-poppins mb-6">
              {currentStep === 1 && 'Patient Info'}
              {currentStep === 2 && 'Health Details'}
              {currentStep === 3 && 'Test Type Details'}
              {currentStep === 4 && 'Summary'}
            </h2>
            {currentStep === 1 && (
              <div className="flex flex-col gap-6">
                {/* Patient Mode Toggle */}
                <div className="flex rounded-lg border border-[#d9d9d9] overflow-hidden">
                  <button
                    onClick={() => handleModeChange('new')}
                    className={`flex-1 h-11 text-sm font-medium font-poppins transition-colors ${
                      patientMode === 'new'
                        ? 'bg-[#2c7be5] text-white'
                        : 'bg-white text-[#637381] hover:bg-gray-50'
                    }`}
                  >
                    New Patient
                  </button>
                  <button
                    onClick={() => handleModeChange('existing')}
                    className={`flex-1 h-11 text-sm font-medium font-poppins transition-colors ${
                      patientMode === 'existing'
                        ? 'bg-[#2c7be5] text-white'
                        : 'bg-white text-[#637381] hover:bg-gray-50'
                    }`}
                  >
                    Existing Patient
                  </button>
                </div>

                {patientMode === 'existing' ? (
                  <div className="flex flex-col gap-[26px]">
                    {/* Community filter for existing patient search */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-[#637381] font-poppins">Filter by Community (optional)</label>
                      <div className="relative h-12 rounded bg-white border border-[#d9d9d9] focus-within:border-[#2c7be5] focus-within:ring-2 focus-within:ring-[#2c7be5]/40">
                        <select
                          value={formData.community}
                          onChange={(e) => {
                            setFormData((prev) => ({ ...prev, community: e.target.value }));
                            setSelectedPatientId('');
                            setSelectedPatientDisplay('');
                            setPatientSearchQuery('');
                          }}
                          className="w-full h-full px-[22px] bg-transparent text-[#212b36] font-poppins appearance-none focus:outline-none cursor-pointer"
                        >
                          <option value="">All Communities</option>
                          {communities.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                        <svg className="absolute top-1/2 right-[10px] -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Patient search */}
                    <div className="flex flex-col gap-1.5" ref={patientDropdownRef}>
                      <label className="text-sm font-medium text-[#637381] font-poppins">Search Patient</label>
                      <div className="relative">
                        <div className={`h-12 rounded bg-white border ${selectedPatientId ? 'border-green-500 bg-green-50/30' : 'border-[#d9d9d9]'} focus-within:border-[#2c7be5] focus-within:ring-2 focus-within:ring-[#2c7be5]/40`}>
                          <input
                            type="text"
                            value={patientSearchQuery}
                            onChange={(e) => {
                              setPatientSearchQuery(e.target.value);
                              setSelectedPatientId('');
                              setSelectedPatientDisplay('');
                              setShowPatientDropdown(true);
                            }}
                            onFocus={() => setShowPatientDropdown(true)}
                            placeholder="Type patient name or phone..."
                            className="w-full h-full px-[22px] bg-transparent text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none cursor-text"
                          />
                        </div>
                        {/* Dropdown results */}
                        {showPatientDropdown && (patientSearchQuery.trim() || formData.community) && (
                          <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-[#d9d9d9] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {loadingPatients ? (
                              <div className="px-4 py-3 text-sm text-gray-500 font-poppins">Searching...</div>
                            ) : patientSearchResults.length === 0 ? (
                              <div className="px-4 py-3 text-sm text-gray-500 font-poppins">No patients found</div>
                            ) : (
                              patientSearchResults.map((p: any) => (
                                <button
                                  key={p._id}
                                  onClick={() => handleSelectPatient(p)}
                                  className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                                    selectedPatientId === p._id ? 'bg-blue-50' : ''
                                  }`}
                                >
                                  <div className="text-sm font-medium text-[#212b36] font-poppins">
                                    {p.firstName} {p.lastName}
                                  </div>
                                  <div className="text-xs text-gray-500 font-poppins mt-0.5">
                                    {p.phone && `${p.phone} · `}
                                    {p.community?.name || 'Unknown community'}
                                    {p.age ? ` · Age ${p.age}` : ''}
                                    {p.numberOfTests ? ` · ${p.numberOfTests} test${p.numberOfTests > 1 ? 's' : ''}` : ''}
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                      {!selectedPatientId && (
                        <p className="text-xs text-gray-400 font-poppins">Select a community or type a name/phone to search</p>
                      )}
                    </div>

                    {/* Selected patient preview */}
                    {selectedPatientId && (
                      <div className="rounded-lg border border-green-200 bg-green-50/50 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm font-medium text-green-700 font-poppins">Patient Selected</span>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedPatientId('');
                              setSelectedPatientDisplay('');
                              setPatientSearchQuery('');
                              setFormData({ lga: '', community: formData.community, firstName: '', lastName: '', age: '', gender: 'male', phoneNumber: '' });
                            }}
                            className="text-xs text-red-500 hover:text-red-700 font-poppins"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm font-poppins">
                          <div><span className="text-[#637381]">Name:</span> <span className="text-[#212b36] font-medium">{formData.firstName} {formData.lastName}</span></div>
                          <div><span className="text-[#637381]">Phone:</span> <span className="text-[#212b36]">{formData.phoneNumber || '-'}</span></div>
                          <div><span className="text-[#637381]">Age:</span> <span className="text-[#212b36]">{formData.age || '-'}</span></div>
                          <div><span className="text-[#637381]">Gender:</span> <span className="text-[#212b36] capitalize">{formData.gender || '-'}</span></div>
                          <div className="col-span-2"><span className="text-[#637381]">Community:</span> <span className="text-[#212b36]">{communities.find(c => c.value === formData.community)?.label || '-'}</span></div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
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
              </div>
            )}
            {currentStep === 2 && (
              <div className="flex flex-col gap-6">
                <div className="h-8 bg-[#ecf4ff] rounded px-3 flex items-center">
                  <span className="text-sm font-medium text-[#2c7be5] font-poppins">Health Metrics</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#637381] font-poppins">Height (cm)</label>
                    <div className="h-12 rounded bg-white border border-[#d9d9d9] focus-within:border-[#2c7be5] focus-within:ring-2 focus-within:ring-[#2c7be5]/40">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="300"
                        value={testDetails.heightCm}
                        onChange={(e) => handleTestDetailsChange('heightCm', e.target.value)}
                        placeholder="e.g. 170"
                        className="w-full h-full px-[22px] bg-transparent text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none cursor-text"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#637381] font-poppins">Weight (kg)</label>
                    <div className="h-12 rounded bg-white border border-[#d9d9d9] focus-within:border-[#2c7be5] focus-within:ring-2 focus-within:ring-[#2c7be5]/40">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="500"
                        value={testDetails.weightKg}
                        onChange={(e) => handleTestDetailsChange('weightKg', e.target.value)}
                        placeholder="e.g. 70"
                        className="w-full h-full px-[22px] bg-transparent text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none cursor-text"
                      />
                    </div>
                  </div>
                </div>

                {(() => {
                  const bmi = testDetails.heightCm && testDetails.weightKg ? calculateBMI(parseFloat(testDetails.weightKg), parseFloat(testDetails.heightCm)) : null;
                  return bmi ? (
                    <div className="flex items-center gap-3 p-3 rounded border border-[#d9d9d9] bg-gray-50">
                      <span className="text-sm font-medium text-[#637381] font-poppins">BMI:</span>
                      <span className="text-sm font-semibold text-[#212b36] font-poppins">{bmi.bmi}</span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-white">{bmi.category}</span>
                    </div>
                  ) : null;
                })()}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#637381] font-poppins">BP Systolic (mmHg)</label>
                    <div className="h-12 rounded bg-white border border-[#d9d9d9] focus-within:border-[#2c7be5] focus-within:ring-2 focus-within:ring-[#2c7be5]/40">
                      <input
                        type="number"
                        min="0"
                        max="300"
                        value={testDetails.bloodPressureSystolic}
                        onChange={(e) => handleTestDetailsChange('bloodPressureSystolic', e.target.value)}
                        placeholder="e.g. 120"
                        className="w-full h-full px-[22px] bg-transparent text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none cursor-text"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#637381] font-poppins">BP Diastolic (mmHg)</label>
                    <div className="h-12 rounded bg-white border border-[#d9d9d9] focus-within:border-[#2c7be5] focus-within:ring-2 focus-within:ring-[#2c7be5]/40">
                      <input
                        type="number"
                        min="0"
                        max="200"
                        value={testDetails.bloodPressureDiastolic}
                        onChange={(e) => handleTestDetailsChange('bloodPressureDiastolic', e.target.value)}
                        placeholder="e.g. 80"
                        className="w-full h-full px-[22px] bg-transparent text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none cursor-text"
                      />
                    </div>
                  </div>
                </div>

                {(() => {
                  const bp = testDetails.bloodPressureSystolic && testDetails.bloodPressureDiastolic
                    ? classifyBloodPressure(parseInt(testDetails.bloodPressureSystolic, 10), parseInt(testDetails.bloodPressureDiastolic, 10))
                    : null;
                  return bp ? (
                    <div className="flex items-center gap-3 p-3 rounded border border-[#d9d9d9] bg-gray-50">
                      <span className="text-sm font-medium text-[#637381] font-poppins">Blood Pressure:</span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-white">{bp}</span>
                    </div>
                  ) : null;
                })()}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#637381] font-poppins">Glucose Level</label>
                    <div className="h-12 rounded bg-white border border-[#d9d9d9] focus-within:border-[#2c7be5] focus-within:ring-2 focus-within:ring-[#2c7be5]/40">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={testDetails.glucoseLevel}
                        onChange={(e) => handleTestDetailsChange('glucoseLevel', e.target.value)}
                        placeholder="e.g. 95"
                        className="w-full h-full px-[22px] bg-transparent text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none cursor-text"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#637381] font-poppins">Glucose Unit</label>
                    <div className="relative h-12 rounded bg-white border border-[#d9d9d9] focus-within:border-[#2c7be5] focus-within:ring-2 focus-within:ring-[#2c7be5]/40">
                      <select
                        value={testDetails.glucoseUnit}
                        onChange={(e) => handleTestDetailsChange('glucoseUnit', e.target.value)}
                        className="w-full h-full px-5 bg-transparent text-sm font-poppins appearance-none focus:outline-none cursor-pointer text-[#212b36]"
                      >
                        <option value="mg/dL">mg/dL</option>
                        <option value="mmol/L">mmol/L</option>
                      </select>
                      <svg className="absolute top-1/2 right-2.5 -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {currentStep === 3 && (
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
                hideHealthMetrics
                hideTestResult
                hideTestImage
              />
            )}
            {currentStep === 4 && (
              <div className="flex flex-col gap-6">
                {/* Patient Info Section */}
                <div className="flex flex-col gap-4">
                  <div className="h-8 bg-[#ecf4ff] rounded px-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#2c7be5] font-poppins">Patient Info</span>
                    {patientMode === 'existing' && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-poppins">Existing Patient</span>
                    )}
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

                  {/* Officer Note */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#637381] font-poppins">Officer Note</label>
                    <div className="min-h-20 rounded bg-white border border-[#d9d9d9] flex items-start p-[22px]">
                      <span className="text-[#212b36] font-poppins text-sm">{testDetails.officerNote || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Health Metrics Section */}
                {(testDetails.heightCm || testDetails.weightKg || testDetails.bloodPressureSystolic || testDetails.glucoseLevel) && (
                  <div className="flex flex-col gap-4">
                    <div className="h-8 bg-[#ecf4ff] rounded px-3 flex items-center">
                      <span className="text-sm font-medium text-[#2c7be5] font-poppins">Health Metrics</span>
                    </div>

                    {(testDetails.heightCm || testDetails.weightKg) && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-[#637381] font-poppins">Height</label>
                          <div className="h-12 rounded bg-white border border-[#d9d9d9] flex items-center px-[22px]">
                            <span className="text-[#212b36] font-poppins text-sm">{testDetails.heightCm ? `${testDetails.heightCm} cm` : '-'}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-[#637381] font-poppins">Weight</label>
                          <div className="h-12 rounded bg-white border border-[#d9d9d9] flex items-center px-[22px]">
                            <span className="text-[#212b36] font-poppins text-sm">{testDetails.weightKg ? `${testDetails.weightKg} kg` : '-'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {testDetails.heightCm && testDetails.weightKg && (() => {
                      const bmi = calculateBMI(parseFloat(testDetails.weightKg), parseFloat(testDetails.heightCm));
                      return bmi ? (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-[#637381] font-poppins">BMI</label>
                          <div className="h-12 rounded bg-white border border-[#d9d9d9] flex items-center px-[22px] gap-3">
                            <span className="text-[#212b36] font-poppins text-sm font-semibold">{bmi.bmi}</span>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-gray-50">{bmi.category}</span>
                          </div>
                        </div>
                      ) : null;
                    })()}

                    {(testDetails.bloodPressureSystolic || testDetails.bloodPressureDiastolic) && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-[#637381] font-poppins">Blood Pressure</label>
                        <div className="h-12 rounded bg-white border border-[#d9d9d9] flex items-center px-[22px] gap-3">
                          <span className="text-[#212b36] font-poppins text-sm">
                            {testDetails.bloodPressureSystolic || '-'}/{testDetails.bloodPressureDiastolic || '-'} mmHg
                          </span>
                          {(() => {
                            const bp = classifyBloodPressure(
                              parseInt(testDetails.bloodPressureSystolic, 10),
                              parseInt(testDetails.bloodPressureDiastolic, 10)
                            );
                            return bp ? (
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-gray-50">{bp}</span>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    )}

                    {testDetails.glucoseLevel && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-[#637381] font-poppins">Glucose Level</label>
                        <div className="h-12 rounded bg-white border border-[#d9d9d9] flex items-center px-[22px]">
                          <span className="text-[#212b36] font-poppins text-sm">{testDetails.glucoseLevel} {testDetails.glucoseUnit || 'mg/dL'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
