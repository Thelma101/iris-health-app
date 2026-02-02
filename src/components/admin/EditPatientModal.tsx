'use client';

import React, { useState, useEffect } from 'react';
import { toISODateFormat, normalizeAge } from '@/lib/utils/validation';

interface PatientData {
  id: string;
  name: string;
  lga: string;
  community: string;
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  phoneNumber: string;
  testsTaken?: number;
  lastTestResult?: string;
}

interface TestDetails {
  testType: string;
  testResult: string;
  dateConducted: string;
  officerNote: string;
  testSheetImage?: string;
}

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedPatient: PatientData) => Promise<void> | void;
  patient: PatientData;
  testDetails?: TestDetails;
  patientImage?: string;
}

export default function EditPatientModal({
  isOpen,
  onClose,
  onUpdate,
  patient,
  testDetails,
  patientImage,
}: EditPatientModalProps) {
  const [formData, setFormData] = useState<PatientData>(patient);
  const [testData, setTestData] = useState<TestDetails>(() => ({
    testType: testDetails?.testType || '',
    testResult: testDetails?.testResult || '',
    dateConducted: toISODateFormat(testDetails?.dateConducted || ''),
    officerNote: testDetails?.officerNote || '',
    testSheetImage: testDetails?.testSheetImage || '',
  }));
  const [isSaving, setIsSaving] = useState(false);

  // Sync formData with patient prop when it changes
  useEffect(() => {
    setFormData({
      ...patient,
      age: normalizeAge(patient.age),
    });
  }, [patient]);

  // Sync testData with testDetails prop when it changes
  useEffect(() => {
    if (testDetails) {
      setTestData({
        ...testDetails,
        dateConducted: toISODateFormat(testDetails.dateConducted),
      });
    }
  }, [testDetails]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof PatientData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTestInputChange = (field: keyof TestDetails, value: string) => {
    setTestData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      // Call the actual update callback with form data
      await onUpdate(formData);
    } catch (error) {
      // Error handling connected to logging service
      console.error('Error updating patient:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-white/30 backdrop-blur-sm cursor-pointer" onClick={onClose} />

      {/* Modal Drawer - Right aligned like PatientDetailsModal */}
      <div 
        className="fixed right-0 top-0 h-screen w-full max-w-[466px] sm:w-[466px] bg-white z-50 flex flex-col overflow-hidden shadow-xl transition-all duration-200"
        style={{ width: '100vw', maxWidth: 466 }}
      >
          {/* Header */}
          <div className="border-b border-[#d9d9d9] h-12 flex items-center justify-between px-[22px] flex-shrink-0">
            <h2 className="text-xl font-medium text-[#212b36] font-poppins">
              Edit {formData.firstName} {formData.lastName}
            </h2>
            <button
              onClick={onClose}
              disabled={isSaving}
              className="cursor-pointer hover:opacity-70 transition-opacity p-1 disabled:opacity-50"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-[10px] py-6">
            <div className="flex flex-col gap-6 w-full max-w-[446px] mx-auto">
            {/* Patient Info Section */}
            <div className="flex flex-col gap-3">
              <div className="bg-[#e8f1ff] border-b-2 border-[#2c7be5] py-1 px-1">
                <h3 className="text-base font-medium text-[#212b36] font-poppins">Patient Info</h3>
              </div>

              <div className="flex flex-col gap-3">
                {/* Full Width Fields */}
                <div className="flex flex-col gap-0.5">
                  <label className="text-sm font-medium text-[#b1b9c0] font-poppins">LGA</label>
                  <input
                    type="text"
                    value={formData.lga}
                    onChange={(e) => handleInputChange('lga', e.target.value)}
                    className="w-full h-7 px-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins focus:outline-none focus:border-[#2c7be5] transition-colors"
                    disabled={isSaving}
                  />
                </div>

                <div className="flex flex-col gap-0.5">
                  <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Select Community</label>
                  <input
                    type="text"
                    value={formData.community}
                    onChange={(e) => handleInputChange('community', e.target.value)}
                    className="w-full h-7 px-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins focus:outline-none focus:border-[#2c7be5] transition-colors"
                    disabled={isSaving}
                  />
                </div>

                {/* Two Column Fields */}
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-0.5">
                    <label className="text-sm font-medium text-[#b1b9c0] font-poppins">First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full h-7 px-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins focus:outline-none focus:border-[#2c7be5] transition-colors"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-0.5">
                    <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full h-7 px-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins focus:outline-none focus:border-[#2c7be5] transition-colors"
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-0.5">
                    <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Age</label>
                    <input
                      type="text"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      className="w-full h-7 px-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins focus:outline-none focus:border-[#2c7be5] transition-colors"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-0.5">
                    <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full h-7 px-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins focus:outline-none focus:border-[#2c7be5] transition-colors"
                      disabled={isSaving}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="w-full h-7 px-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins focus:outline-none focus:border-[#2c7be5] transition-colors"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

            {/* Test Details Section - Read Only */}
            {testDetails && (
              <div className="flex flex-col gap-3">
                <div className="bg-[#e8f1ff] border-b-2 border-[#2c7be5] py-1 px-1">
                  <h3 className="text-base font-medium text-[#212b36] font-poppins">Test Details (Read Only)</h3>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Test Type</label>
                    <div className="w-full h-7 px-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins bg-gray-50 flex items-center">
                      {testData.testType || 'N/A'}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1 flex flex-col gap-0.5">
                      <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Test Result</label>
                      <div className="w-full h-7 px-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins bg-gray-50 flex items-center">
                        {testData.testResult || 'N/A'}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-0.5">
                      <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Date Conducted</label>
                      <div className="w-full h-7 px-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins bg-gray-50 flex items-center">
                        {testData.dateConducted ? new Date(testData.dateConducted).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Officer Note</label>
                    <div className="w-full p-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins bg-gray-50 min-h-[5rem]">
                      {testData.officerNote || 'No notes available'}
                    </div>
                  </div>

                  {/* Test Sheet - Read only */}
                  {testData.testSheetImage && (
                    <div className="flex flex-col gap-0.5">
                      <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Test Sheet</label>
                      <div className="relative w-full max-w-[200px]">
                        <img 
                          src={testData.testSheetImage} 
                          alt="Test Sheet" 
                          className="w-full rounded border border-[#d9d9d9] object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Patient Image Section */}
            {patientImage && (
              <div className="flex flex-col gap-3">
                <div className="bg-[#e8f1ff] border-b-2 border-[#2c7be5] py-1 px-1">
                  <h3 className="text-base font-medium text-[#212b36] font-poppins">Patient Image</h3>
                </div>
                <div className="relative w-full max-w-[200px]">
                  <img 
                    src={patientImage} 
                    alt="Patient" 
                    className="w-full rounded border border-[#d9d9d9] object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer with Update Button */}
          <div className="border-t border-[#d9d9d9] px-[22px] py-4 flex justify-end gap-3 flex-shrink-0">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-6 h-10 border border-[#d9d9d9] rounded text-[#212b36] font-medium font-poppins hover:bg-[#f4f5f7] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={isSaving}
              className="px-6 h-10 bg-[#2c7be5] text-white rounded font-medium font-poppins hover:bg-[#1e5aa8] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </>
              ) : (
                'Update'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
