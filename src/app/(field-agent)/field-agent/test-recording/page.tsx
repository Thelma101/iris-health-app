'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import FormStepIndicator from '@/components/field-agent/FormStepIndicator';
import {
  SelectField,
  InputField,
  TextAreaField,
  DateField,
  FileUploadField,
} from '@/components/field-agent/FormFields';
import { fieldAgentApi } from '@/lib/api/field-agent';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface PatientInfo {
  lga: string;
  community: string;
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  phone: string;
  isExistingPatient: boolean;
  patientId?: string;
}

interface TestDetails {
  testType: string;
  dateConducted: string;
  testResult: string;
  officerNote: string;
  testImage: File | null;
}

interface PatientUpload {
  patientPhoto: File | null;
}

const STEPS = [
  { label: 'Patient', subLabel: ' info' },
  { label: 'Test Details' },
  { label: 'Upload Photos/Attachment' },
  { label: 'Submit' },
];

const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

const TEST_TYPES = [
  { value: 'hiv', label: 'HIV 1/2 Rapid Test' },
  { value: 'malaria', label: 'Malaria Rapid Diagnostic Test (RDT)' },
  { value: 'hepatitis_b', label: 'Hepatitis B Surface Antigen (HBsAg)' },
  { value: 'tb', label: 'Tuberculosis (TB) Sputum Smear' },
  { value: 'cholera', label: 'Cholera Rapid Test' },
  { value: 'blood_pressure', label: 'Blood Pressure' },
  { value: 'blood_sugar', label: 'Blood Sugar' },
];

const TEST_RESULTS = [
  { value: 'positive', label: 'Positive' },
  { value: 'negative', label: 'Negative' },
  { value: 'inconclusive', label: 'Inconclusive' },
  { value: 'reactive', label: 'Reactive' },
  { value: 'non_reactive', label: 'Non-Reactive' },
  { value: 'invalid', label: 'Invalid' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'low', label: 'Low' },
  { value: 'elevated', label: 'Elevated' },
  { value: 'high_risk', label: 'High Risk' },
  { value: 'prehypertension', label: 'Prehypertension' },
  { value: 'hypertension', label: 'Hypertension' },
  { value: 'underweight', label: 'Underweight' },
  { value: 'overweight', label: 'Overweight' },
  { value: 'obese', label: 'Obese' },
  { value: 'mild_anemia', label: 'Mild Anemia' },
  { value: 'severe_anemia', label: 'Severe Anemia' },
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'adequate', label: 'Adequate' },
  { value: 'inadequate', label: 'Inadequate' },
  { value: 'safe', label: 'Safe' },
  { value: 'contaminated', label: 'Contaminated' },
];

export default function TestRecordingMultiStepPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form data
  const [communities, setCommunities] = useState<{ value: string; label: string; lga?: string }[]>([]);
  const [lgas, setLgas] = useState<{ value: string; label: string }[]>([]);

  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    lga: '',
    community: '',
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    phone: '',
    isExistingPatient: false,
  });

  const [testDetails, setTestDetails] = useState<TestDetails>({
    testType: '',
    dateConducted: '',
    testResult: '',
    officerNote: '',
    testImage: null,
  });

  const [patientUpload, setPatientUpload] = useState<PatientUpload>({
    patientPhoto: null,
  });

  const [testImagePreview, setTestImagePreview] = useState<string | null>(null);
  const [patientPhotoPreview, setPatientPhotoPreview] = useState<string | null>(null);

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
      
      setCommunities(
        communitiesData.map((c: any) => ({
          value: c._id || c.id,
          label: c.name,
          lga: c.lga,
        }))
      );
    } catch (err) {
      console.error('Error fetching communities:', err);
      // Set demo data
      setLgas([{ value: 'Ikorodu', label: 'Ikorodu' }]);
      setCommunities([
        { value: '1', label: 'Bayeku', lga: 'Ikorodu' },
        { value: '2', label: 'Igbogbo', lga: 'Ikorodu' },
        { value: '3', label: 'Baiyeku Ikorodu', lga: 'Ikorodu' },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle file preview
  useEffect(() => {
    if (testDetails.testImage) {
      const url = URL.createObjectURL(testDetails.testImage);
      setTestImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setTestImagePreview(null);
  }, [testDetails.testImage]);

  useEffect(() => {
    if (patientUpload.patientPhoto) {
      const url = URL.createObjectURL(patientUpload.patientPhoto);
      setPatientPhotoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setPatientPhotoPreview(null);
  }, [patientUpload.patientPhoto]);

  // Filter communities by selected LGA
  const filteredCommunities = patientInfo.lga
    ? communities.filter((c) => c.lga === patientInfo.lga)
    : communities;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      // Create patient if new
      let patientId = patientInfo.patientId;
      if (!patientInfo.isExistingPatient) {
        const patientRes = await fieldAgentApi.createPatient({
          firstName: patientInfo.firstName,
          lastName: patientInfo.lastName,
          age: parseInt(patientInfo.age),
          gender: patientInfo.gender,
          phone: patientInfo.phone,
          community: patientInfo.community,
        });
        patientId = (patientRes.data as any)?.data?.patient?._id || 
                    (patientRes.data as any)?.patient?._id;
      }

      // Create visitation/test record
      const visitationData = {
        patient: patientId,
        community: patientInfo.community,
        testType: testDetails.testType,
        testResult: testDetails.testResult,
        dateConducted: testDetails.dateConducted,
        notes: testDetails.officerNote,
      };

      await fieldAgentApi.createVisitation(visitationData);
      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/field-agent/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Error submitting test record:', err);
      setError(err.message || 'Failed to submit test record');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="flex flex-col gap-6">
            <p className="font-poppins font-medium text-xl text-[#212b36]">
              Patient Info
            </p>
            <div className="flex flex-col gap-[26px]">
              <SelectField
                label="LGA"
                value={patientInfo.lga}
                onChange={(value) =>
                  setPatientInfo({ ...patientInfo, lga: value, community: '' })
                }
                options={lgas}
                placeholder="Select LGA"
              />
              <SelectField
                label="Select Community"
                value={patientInfo.community}
                onChange={(value) =>
                  setPatientInfo({ ...patientInfo, community: value })
                }
                options={filteredCommunities}
                placeholder="Select Community"
              />
              <InputField
                label="First Name"
                value={patientInfo.firstName}
                onChange={(value) =>
                  setPatientInfo({ ...patientInfo, firstName: value })
                }
                placeholder="Tayo"
              />
              <InputField
                label="Last Name"
                value={patientInfo.lastName}
                onChange={(value) =>
                  setPatientInfo({ ...patientInfo, lastName: value })
                }
                placeholder="Ayo"
              />
              <InputField
                label="Age"
                value={patientInfo.age}
                onChange={(value) =>
                  setPatientInfo({ ...patientInfo, age: value })
                }
                placeholder="67"
                type="number"
              />
              <SelectField
                label="Gender"
                value={patientInfo.gender}
                onChange={(value) =>
                  setPatientInfo({ ...patientInfo, gender: value })
                }
                options={GENDERS}
                placeholder="Select Gender"
              />
              <InputField
                label="Phone Number"
                value={patientInfo.phone}
                onChange={(value) =>
                  setPatientInfo({ ...patientInfo, phone: value })
                }
                placeholder="080537736267"
                type="tel"
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="flex flex-col gap-6">
            <p className="font-poppins font-medium text-xl text-[#212b36]">
              Test Details
            </p>
            <div className="flex flex-col gap-[26px]">
              <SelectField
                label="Test Type"
                value={testDetails.testType}
                onChange={(value) =>
                  setTestDetails({ ...testDetails, testType: value })
                }
                options={TEST_TYPES}
                placeholder="Select Test Type"
              />
              <DateField
                label="Date Conducted"
                value={testDetails.dateConducted}
                onChange={(value) =>
                  setTestDetails({ ...testDetails, dateConducted: value })
                }
              />
              <SelectField
                label="Test Result"
                value={testDetails.testResult}
                onChange={(value) =>
                  setTestDetails({ ...testDetails, testResult: value })
                }
                options={TEST_RESULTS}
                placeholder="Select Result"
              />
              <TextAreaField
                label="Officer Note"
                value={testDetails.officerNote}
                onChange={(value) =>
                  setTestDetails({ ...testDetails, officerNote: value })
                }
                placeholder="Add notes here..."
              />
              <FileUploadField
                label=""
                value={testDetails.testImage}
                onChange={(file) =>
                  setTestDetails({ ...testDetails, testImage: file })
                }
                placeholder="Upload Test Image"
                preview={testImagePreview}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col gap-6">
            <p className="font-poppins font-medium text-xl text-[#212b36]">
              Upload photo/attachment
            </p>
            <FileUploadField
              label="Patient photo"
              value={patientUpload.patientPhoto}
              onChange={(file) =>
                setPatientUpload({ ...patientUpload, patientPhoto: file })
              }
              placeholder="Upload Patient Image"
              preview={patientPhotoPreview}
            />
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col gap-6">
            <p className="font-poppins font-medium text-lg text-[#212b36]">
              Summary
            </p>

            {/* Patient Info Section */}
            <div className="flex flex-col gap-[11px]">
              <div className="bg-[#e8f1ff] border-b border-[#2c7be5] px-1 py-1">
                <p className="font-poppins font-medium text-base text-[#212b36]">
                  Patient Info
                </p>
              </div>
              <div className="flex flex-col gap-[26px]">
                <SummaryField label="LGA" value={patientInfo.lga} hasDropdown />
                <SummaryField label="Select Community" value={communities.find(c => c.value === patientInfo.community)?.label || patientInfo.community} hasDropdown />
                <SummaryField label="First Name" value={patientInfo.firstName} />
                <SummaryField label="Last Name" value={patientInfo.lastName} />
                <SummaryField label="Age" value={patientInfo.age} />
                <SummaryField label="Gender" value={patientInfo.gender} hasDropdown />
                <SummaryField label="Phone Number" value={patientInfo.phone} />
              </div>
            </div>

            {/* Test Details Section */}
            <div className="flex flex-col gap-6">
              <div className="bg-[#e8f1ff] border-b border-[#2c7be5] h-[30px] flex items-center px-1">
                <p className="font-poppins font-medium text-base text-[#212b36]">
                  Test Details
                </p>
              </div>
              <div className="flex flex-col gap-[26px]">
                <SummaryField label="Test Type" value={TEST_TYPES.find(t => t.value === testDetails.testType)?.label || testDetails.testType} hasDropdown />
                <SummaryField label="Date Conducted" value={testDetails.dateConducted} />
                <SummaryField label="Test Result" value={TEST_RESULTS.find(r => r.value === testDetails.testResult)?.label || testDetails.testResult} hasDropdown />
                <div className="flex flex-col gap-[6px]">
                  <p className="font-poppins font-medium text-sm text-[#637381]">
                    Officer Note
                  </p>
                  <div className="h-[95px] bg-white border border-[#d9d9d9] rounded p-4 overflow-auto">
                    <p className="font-poppins text-sm text-[#212b36]">
                      {testDetails.officerNote || '-'}
                    </p>
                  </div>
                </div>
                {testImagePreview && (
                  <div className="border border-dashed border-[#d9d9d9] rounded p-2 flex items-center justify-center">
                    <img
                      src={testImagePreview}
                      alt="Test"
                      className="max-h-[70px] object-contain"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Patient Image Section */}
            <div className="flex flex-col gap-6">
              <div className="bg-[#e8f1ff] border-b border-[#2c7be5] h-[30px] flex items-center px-1">
                <p className="font-poppins font-medium text-base text-[#212b36]">
                  Patient Image
                </p>
              </div>
              <div className="flex flex-col gap-[6px]">
                <p className="font-poppins font-medium text-sm text-[#637381]">
                  Patient photo
                </p>
                <div className="h-[125px] border border-dashed border-[#d9d9d9] rounded flex items-center justify-center">
                  {patientPhotoPreview ? (
                    <img
                      src={patientPhotoPreview}
                      alt="Patient"
                      className="max-h-[109px] object-contain"
                    />
                  ) : (
                    <p className="text-[#637381] text-sm">No image uploaded</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white border border-[#d9d9d9] rounded-tl-[20px] rounded-bl-[20px] overflow-hidden min-h-screen">
      <div className="p-6">
        {/* Page Title */}
        <div
          className="h-[50px] rounded-lg border-2 border-[#fff9e6] flex items-center px-4 mb-6"
          style={{
            backgroundImage:
              'linear-gradient(172.45deg, rgba(255, 249, 230, 1) 3.64%, rgba(232, 241, 255, 1) 100.8%)',
          }}
        >
          <h1 className="font-poppins font-semibold text-xl text-[#212b36] uppercase">
            TEST RECORDING
          </h1>
        </div>

        {/* Form Container */}
        <div className="max-w-[768px] mx-auto bg-white border border-[#d9d9d9] rounded-lg p-6">
          {/* Step Indicator */}
          <div className="flex justify-center mb-8">
            <FormStepIndicator currentStep={currentStep} steps={STEPS} />
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded text-green-700">
              Test record submitted successfully! Redirecting...
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

          {/* Step Content */}
          <div className="max-w-[517px] mx-auto mb-8">{renderStepContent()}</div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center max-w-[654px] mx-auto">
            {currentStep > 0 ? (
              <button
                onClick={handleBack}
                className="h-12 px-6 bg-white border border-[#2c7be5] rounded-[10px] font-inter font-medium text-base text-[#2c7be5] hover:bg-blue-50 transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}
            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="h-12 px-6 bg-[#2c7be5] rounded-[10px] font-inter font-medium text-base text-white hover:bg-blue-600 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="h-12 px-6 bg-[#2c7be5] rounded-[10px] font-inter font-medium text-base text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Summary field component
function SummaryField({
  label,
  value,
  hasDropdown = false,
}: {
  label: string;
  value: string;
  hasDropdown?: boolean;
}) {
  return (
    <div className="flex flex-col gap-[6px]">
      <p className="font-poppins font-medium text-sm text-[#637381]">{label}</p>
      <div className="relative h-12 bg-white border border-[#d9d9d9] rounded flex items-center px-[21px]">
        <p className="font-poppins text-sm text-[#212b36]">{value || '-'}</p>
        {hasDropdown && (
          <div className="absolute right-[9px] top-1/2 -translate-y-1/2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9L12 15L18 9"
                stroke="#637381"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
