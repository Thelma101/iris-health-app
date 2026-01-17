'use client';
import React, { useState } from 'react';
import CreateTestTypeModal from '@/components/admin/CreateTestTypeModal';
import SubmitTestModal from '@/components/admin/SubmitTestModal';
import TestTypeListModal from '@/components/admin/TestTypeListModal';
import EditTestTypeModal from '@/components/admin/EditTestTypeModal';
import FormProgress from '@/components/admin/submit-test/FormProgress';
import PatientInfoForm from '@/components/admin/submit-test/PatientInfoForm';
import TestDetailsForm from '@/components/admin/submit-test/TestDetailsForm';
import { useFormStep } from '@/hooks/useFormStep';
import { LGA_OPTIONS, COMMUNITY_OPTIONS, GENDER_OPTIONS } from '@/lib/constants/location-options';
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

export default function SubmitTestPage() {
  const { currentStep, nextStep, previousStep } = useFormStep(1);

  // Form State
  const [formData, setFormData] = useState<PatientInfo>({
    lga: 'Ikorodu',
    community: 'Bayeku',
    firstName: '',
    lastName: '',
    age: '',
    gender: 'Male',
    phoneNumber: '',
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

  // Handlers
  const handlePatientInfoChange = (field: keyof PatientInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    console.log('=== ADD TEST TYPE ===' );
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
    console.log('=== EDIT TEST TYPE ===' );
    console.log('Editing ID:', id);
    console.log('New name:', testType);
    console.log('New results:', expectedResults);
    console.log('Current test types:', testTypes);
    
    const updated = testTypes.map((t) => (t.id === id ? { ...t, name: testType, results: expectedResults } : t));
    console.log('Updated test types:', updated);
    setTestTypes(updated);
  };

  const handleDeleteTestType = (id: number) => {
    console.log('=== DELETE TEST TYPE ===' );
    console.log('Deleting ID:', id);
    console.log('Current test types:', testTypes);
    
    const filtered = testTypes.filter((t) => t.id !== id);
    console.log('Filtered test types:', filtered);
    setTestTypes(filtered);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Prepare payload for API
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phoneNumber,
        age: formData.age,
        gender: formData.gender,
        community: formData.community,
        lga: formData.lga,
        testDetails: [
          {
            testType: testDetails.testType,
            dateConducted: testDetails.dateConducted,
            testResult: testDetails.testResult,
            officerNote: testDetails.officerNote,
            // testImage: testDetails.testImage, // handle file upload separately if needed
          },
        ],
      };
      const res = await api.createPatient(payload);
      if (res.success) {
        setSubmitSuccess(true);
        setIsSubmitModalOpen(false);
        // Optionally reset form or show success UI
      } else {
        setSubmitError(res.error || 'Submission failed');
      }
    } catch (err: any) {
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
            {currentStep === 1 && <PatientInfoForm formData={formData} onChange={handlePatientInfoChange} />}
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
                  <label className="text-sm font-medium text-[#637381] font-poppins">Patient Photo</label>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center justify-center gap-2 h-12 px-[22px] bg-[#2c7be5] text-white border border-[#2c7be5] rounded font-poppins font-medium hover:bg-blue-600 transition-colors cursor-pointer">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Snap Photo
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePatientPhotoChange}
                        className="hidden"
                      />
                    </label>
                    <label className="flex items-center justify-center gap-2 h-12 px-[22px] bg-white border border-[#d9d9d9] text-[#637381] rounded font-poppins font-medium hover:bg-gray-50 transition-colors cursor-pointer">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Upload Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePatientPhotoChange}
                        className="hidden"
                      />
                    </label>
                  </div>
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
              <div className="flex flex-col gap-4 text-sm">
                <div className="border border-[#d9d9d9] rounded p-4">
                  <h3 className="font-semibold text-[#212b36] mb-2">Patient Information</h3>
                  <p className="text-[#637381]">
                    {formData.firstName} {formData.lastName} | {formData.age} | {formData.gender} | {formData.community}, {formData.lga}
                  </p>
                </div>
                <div className="border border-[#d9d9d9] rounded p-4">
                  <h3 className="font-semibold text-[#212b36] mb-2">Test Details</h3>
                  <p className="text-[#637381]">{testDetails.testType} - {testDetails.testResult}</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-4 justify-end mt-8">
            {currentStep > 1 && (
              <button
                onClick={previousStep}
                className="h-12 px-6 rounded-[10px] bg-white border border-[#d9d9d9] text-[#637381] font-medium font-inter hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}
            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="h-12 px-6 rounded-[10px] bg-[#2c7be5] text-white font-medium font-inter hover:bg-blue-600 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="h-12 px-6 rounded-[10px] bg-[#2c7be5] text-white font-medium font-inter hover:bg-blue-600 transition-colors"
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
    </main>
  );
}
