'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import CreateTestTypeModal from '@/components/admin/CreateTestTypeModal';
import SubmitTestModal from '@/components/admin/SubmitTestModal';
import TestTypeListModal from '@/components/admin/TestTypeListModal';
import EditTestTypeModal from '@/components/admin/EditTestTypeModal';
import FormProgress from '@/components/admin/submit-test/FormProgress';
import TestDetailsForm from '@/components/admin/submit-test/TestDetailsForm';
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
  id: number;
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
    testType: 'HIV 1/2 Rapid Test',
    dateConducted: '',
    testResult: 'Positive',
    officerNote: '',
    testImage: null,
  });

  const [patientPhoto, setPatientPhoto] = useState<File | null>(null);
  const [testImagePreview, setTestImagePreview] = useState<string | null>(null);
  const [patientPhotoPreview, setPatientPhotoPreview] = useState<string | null>(null);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

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

  // Fetch communities on mount
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fieldAgentApi.getMyCommunities();
      console.log('Communities API response:', res);
      const communitiesData =
        (res.data as any)?.data?.communities || (res.data as any)?.communities || [];
      console.log('Parsed communities data:', communitiesData);

      // Extract unique LGAs
      const uniqueLgas = [...new Set(communitiesData.map((c: any) => c.lga).filter(Boolean))] as string[];
      setLgas(uniqueLgas.map((lga) => ({ value: lga, label: lga })));

      const mappedCommunities = communitiesData.map((c: any) => ({
        value: c._id || c.id,
        label: c.name,
        lga: c.lga,
      }));
      console.log('Mapped communities with values:', mappedCommunities);
      setCommunities(mappedCommunities);
    } catch (err) {
      console.error('Error fetching communities:', err);
      // Set demo data with valid ObjectId format
      setLgas([{ value: 'Ikorodu', label: 'Ikorodu' }]);
      setCommunities([
        { value: '000000000000000000000001', label: 'Bayeku', lga: 'Ikorodu' },
        { value: '000000000000000000000002', label: 'Igbogbo', lga: 'Ikorodu' },
        { value: '000000000000000000000003', label: 'Baiyeku Ikorodu', lga: 'Ikorodu' },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter communities by selected LGA
  const filteredCommunities = formData.lga
    ? communities.filter((c) => c.lga === formData.lga)
    : communities;

  // Navigation
  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const previousStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Handlers
  const handlePatientInfoChange = (field: keyof PatientInfo, value: string) => {
    if (field === 'lga') {
      setFormData((prev) => ({ ...prev, lga: value, community: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleTestDetailsChange = (field: keyof TestDetails, value: string) => {
    setTestDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleTestImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setTestDetails((prev) => ({ ...prev, testImage: file }));
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

  const handleAddTestType = (testType: string, expectedResults: string[]) => {
    const newTestType: TestType = {
      id: testTypes.length + 1,
      name: testType,
      results: expectedResults,
    };
    setTestTypes([...testTypes, newTestType]);
  };

  const handleEditTestType = (id: number, testType: string, expectedResults: string[]) => {
    setTestTypes(testTypes.map((t) => (t.id === id ? { ...t, name: testType, results: expectedResults } : t)));
  };

  const handleDeleteTestType = (id: number) => {
    setTestTypes(testTypes.filter((t) => t.id !== id));
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

      // Create patient first
      const patientRes = await fieldAgentApi.createPatient({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        age: parseInt(formData.age) || 0,
        gender: formData.gender, // 'male' or 'female' (lowercase)
        phone: formData.phoneNumber?.trim() || '',
        community: communityId,
      });

      console.log('Patient creation response:', patientRes);

      if (!patientRes.success) {
        throw new Error(patientRes.error || 'Failed to create patient');
      }

      const patientId = (patientRes.data as any)?.data?.patient?._id ||
        (patientRes.data as any)?.patient?._id;

      if (!patientId) {
        throw new Error('Failed to get patient ID');
      }

      // Create visitation (test record)
      const visitationRes = await fieldAgentApi.createVisitation({
        patient: patientId,
        testType: testDetails.testType,
        testResult: testDetails.testResult,
        note: testDetails.officerNote,
        dateConducted: testDetails.dateConducted,
      });

      console.log('Visitation creation response:', visitationRes);

      if (!visitationRes.success) {
        throw new Error(visitationRes.error || 'Failed to create test record');
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
        testType: 'HIV 1/2 Rapid Test',
        dateConducted: '',
        testResult: 'Positive',
        officerNote: '',
        testImage: null,
      });
      setPatientPhoto(null);
      setTestImagePreview(null);
      setPatientPhotoPreview(null);
      setCurrentStep(1);

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
    <main className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="h-12 sm:h-[50px] rounded-lg bg-gradient-to-r from-[#fff9e6] to-[#e8f1ff] border-2 border-[#fff9e6] flex items-center px-4 sm:px-5">
        <span className="text-base sm:text-xl font-semibold text-[#212b36] uppercase font-poppins">TEST RECORDING</span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => setIsCreateTestTypeModalOpen(true)}
          className="h-12 px-6 rounded-[10px] bg-white border border-[#2c7be5] text-[#2c7be5] font-medium font-inter hover:bg-blue-50 transition-colors cursor-pointer"
        >
          Create New Test Type
        </button>
        <div className="flex-1" />
        <button
          onClick={() => setIsTestTypeListModalOpen(true)}
          className="h-12 px-6 rounded-[10px] bg-white border border-[#2c7be5] text-[#2c7be5] font-medium font-inter hover:bg-blue-50 transition-colors cursor-pointer"
        >
          View All the Test Type
        </button>
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
                  <div className="relative h-12 rounded bg-white border border-[#d9d9d9]">
                    <select
                      value={formData.lga}
                      onChange={(e) => handlePatientInfoChange('lga', e.target.value)}
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
                </div>

                {/* Community */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#637381] font-poppins">Select Community</label>
                  <div className="relative h-12 rounded bg-white border border-[#d9d9d9]">
                    <select
                      value={formData.community}
                      onChange={(e) => handlePatientInfoChange('community', e.target.value)}
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
                </div>

                {/* First Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#637381] font-poppins">First Name</label>
                  <div className="h-12 rounded bg-white border border-[#d9d9d9]">
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handlePatientInfoChange('firstName', e.target.value)}
                      placeholder="Tayo"
                      className="w-full h-full px-[22px] bg-transparent text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none cursor-text"
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#637381] font-poppins">Last Name</label>
                  <div className="h-12 rounded bg-white border border-[#d9d9d9]">
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handlePatientInfoChange('lastName', e.target.value)}
                      placeholder="Ayo"
                      className="w-full h-full px-[22px] bg-transparent text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none cursor-text"
                    />
                  </div>
                </div>

                {/* Age */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#637381] font-poppins">Age</label>
                  <div className="h-12 rounded bg-white border border-[#d9d9d9]">
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => handlePatientInfoChange('age', e.target.value)}
                      placeholder="67"
                      className="w-full h-full px-[22px] bg-transparent text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none cursor-text"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#637381] font-poppins">Gender</label>
                  <div className="relative h-12 rounded bg-white border border-[#d9d9d9]">
                    <select
                      value={formData.gender}
                      onChange={(e) => handlePatientInfoChange('gender', e.target.value)}
                      className="w-full h-full px-[22px] bg-transparent text-[#212b36] font-poppins appearance-none focus:outline-none cursor-pointer"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    <svg className="absolute top-1/2 right-[10px] -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[#637381] font-poppins">Phone Number</label>
                  <div className="h-12 rounded bg-white border border-[#d9d9d9]">
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handlePatientInfoChange('phoneNumber', e.target.value)}
                      placeholder="080537736267"
                      className="w-full h-full px-[22px] bg-transparent text-[#212b36] placeholder:text-[#d9d9d9] font-poppins focus:outline-none cursor-text"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Test Details */}
            {currentStep === 2 && (
              <TestDetailsForm
                testDetails={testDetails}
                onChange={handleTestDetailsChange}
                onImageChange={handleTestImageChange}
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
                      className="w-full h-[140px] rounded bg-white border-2 border-dashed border-[#d9d9d9] flex flex-col items-center justify-center gap-2 hover:border-[#2c7be5] hover:bg-blue-50/30 transition-colors cursor-pointer"
                    >
                      <span className="text-[#637381] text-base font-normal font-poppins">Upload Patient  Image</span>
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
                              cameraInputRef.current?.click();
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

                  {patientPhoto && (
                    <p className="mt-1 text-sm text-[#637381] font-poppins">
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
                      <span className="text-[#212b36] font-poppins text-sm">{testDetails.testType || '-'}</span>
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

                  {/* Test Image Preview */}
                  {testImagePreview && (
                    <div className="flex flex-col gap-1.5">
                      <div className="w-full max-w-[150px] h-[100px] rounded border border-[#d9d9d9] overflow-hidden relative">
                        <img src={testImagePreview} alt="Test" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setTestDetails(prev => ({ ...prev, testImage: null }));
                            setTestImagePreview(null);
                          }}
                          className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-100"
                        >
                          <svg className="w-3 h-3 text-[#637381]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Patient Image Section */}
                <div className="flex flex-col gap-4">
                  <div className="h-8 bg-[#ecf4ff] rounded px-3 flex items-center">
                    <span className="text-sm font-medium text-[#2c7be5] font-poppins">Patient Image</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-[#637381] font-poppins">Patient photo</label>
                    {patientPhotoPreview ? (
                      <div className="w-full max-w-[200px] h-[150px] rounded border border-[#d9d9d9] overflow-hidden">
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
                className="h-12 px-6 rounded-[10px] bg-[#2c7be5] text-white font-medium font-inter hover:bg-blue-600 transition-colors cursor-pointer"
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
