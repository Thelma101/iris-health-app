'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import CreateTestTypeModal from '@/components/admin/CreateTestTypeModal';
import SubmitTestModal from '@/components/admin/SubmitTestModal';
import TestTypeListModal from '@/components/admin/TestTypeListModal';
import EditTestTypeModal from '@/components/admin/EditTestTypeModal';
import FormProgress from '@/components/admin/submit-test/FormProgress';
import PatientInfoForm from '@/components/admin/submit-test/PatientInfoForm';
import TestDetailsForm from '@/components/admin/submit-test/TestDetailsForm';
import { useFormStep } from '@/hooks/useFormStep';
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
  id: number;
  name: string;
  results: string[];
}

interface CommunityOption {
  value: string;
  label: string;
  lga: string;
}

export default function SubmitTestPage() {
  const { currentStep, nextStep, previousStep } = useFormStep(1);

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
    testType: 'HIV 1/2 Rapid Test',
    dateConducted: new Date().toISOString().split('T')[0], // Default to today's date
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

  // Test Types State - start empty, no dummy data
  const [testTypes, setTestTypes] = useState<TestType[]>([]);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch communities on mount
  const fetchCommunities = useCallback(async () => {
    setLoadingCommunities(true);
    try {
      const res = await api.getCommunities();
      console.log('Communities API response:', res);
      // Access data from ApiResponse wrapper, then extract communities array
      const communitiesData = (res.data as any)?.communities || [];
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
      // Set fallback data with valid ObjectId format
      setLgas([{ value: 'Ikorodu', label: 'Ikorodu' }]);
      setCommunities([
        { value: '000000000000000000000001', label: 'Bayeku', lga: 'Ikorodu' },
        { value: '000000000000000000000002', label: 'Igbogbo', lga: 'Ikorodu' },
      ]);
    } finally {
      setLoadingCommunities(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

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
    console.log('=== ADD TEST TYPE ===');
    console.log('Test type name:', testType);
    console.log('Expected results:', expectedResults);
    console.log('Current test types before add:', testTypes);

    const newTestType: TestType = {
      id: testTypes.length + 1,
      name: testType,
      results: expectedResults,
    };
    console.log('New test type object:', newTestType);

    const updatedTestTypes = [...testTypes, newTestType];
    console.log('Updated test types array:', updatedTestTypes);
    setTestTypes(updatedTestTypes);
  };

  const handleEditTestType = (id: number, testType: string, expectedResults: string[]) => {
    console.log('=== EDIT TEST TYPE ===');
    console.log('Editing ID:', id);
    console.log('New name:', testType);
    console.log('New results:', expectedResults);
    console.log('Current test types:', testTypes);

    const updated = testTypes.map((t) => (t.id === id ? { ...t, name: testType, results: expectedResults } : t));
    console.log('Updated test types:', updated);
    setTestTypes(updated);
  };

  const handleDeleteTestType = (id: number) => {
    console.log('=== DELETE TEST TYPE ===');
    console.log('Deleting ID:', id);
    console.log('Current test types:', testTypes);

    const filtered = testTypes.filter((t) => t.id !== id);
    console.log('Filtered test types:', filtered);
    setTestTypes(filtered);
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
      
      console.log('Submitting patient with payload:', JSON.stringify(payload, null, 2));
      
      const res = await api.createPatient(payload);
      console.log('Create patient response:', res);
      
      if (res.success) {
        setSubmitSuccess(true);
        setIsSubmitModalOpen(false);
        // Reset form after successful submission
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
          testType: 'HIV 1/2 Rapid Test',
          dateConducted: '',
          testResult: 'Positive',
          officerNote: '',
          testImage: null,
        });
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
    <main className="space-y-4 sm:space-y-6">
      <div className="h-12 sm:h-[50px] rounded-lg bg-gradient-to-r from-[#fff9e6] to-[#e8f1ff] border-2 border-[#fff9e6] flex items-center px-4 sm:px-5">
        <span className="text-base sm:text-xl font-semibold text-[#212b36] uppercase font-poppins">TEST RECORDING</span>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          onClick={() => {
            console.log('Opening Create Test Type modal');
            setIsCreateTestTypeModalOpen(true);
          }}
          className="h-12 px-6 rounded-[10px] bg-white border border-[#2c7be5] text-[#2c7be5] font-medium font-inter hover:bg-blue-50 transition-colors cursor-pointer"
        >
          Create New Test Type
        </button>
        <div className="flex-1" />
        <button
          onClick={() => {
            console.log('Opening Test Type List modal, current test types:', testTypes);
            setIsTestTypeListModalOpen(true);
          }}
          className="h-12 px-6 rounded-[10px] bg-white border border-[#2c7be5] text-[#2c7be5] font-medium font-inter hover:bg-blue-50 transition-colors cursor-pointer"
        >
          View All the Test Type
        </button>
      </div>
      <div className="h-px bg-[#d9d9d9]" />
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
              />
            )}
            {currentStep === 2 && (
              <TestDetailsForm testDetails={testDetails} onChange={handleTestDetailsChange} onImageChange={handleTestImageChange} />
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
                    <div className="min-h-20 rounded bg-white border border-[#d9d9d9] flex items-start p-[22px]">
                      <span className="text-[#212b36] font-poppins text-sm">{testDetails.officerNote || '-'}</span>
                    </div>
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
                className="h-12 px-6 rounded-[10px] bg-[#2c7be5] text-white font-medium font-inter hover:bg-blue-600 transition-colors cursor-pointer"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="h-12 px-6 rounded-[10px] bg-[#2c7be5] text-white font-medium font-inter hover:bg-blue-600 transition-colors cursor-pointer"
              >
                Submit
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
