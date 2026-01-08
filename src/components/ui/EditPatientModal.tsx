'use client';

import React, { useState } from 'react';
import ModalBackdrop from './ModalBackdrop';

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
  onUpdate: (updatedPatient: PatientData) => void;
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
  const [testData, setTestData] = useState<TestDetails>(
    testDetails || {
      testType: '',
      testResult: '',
      dateConducted: '',
      officerNote: '',
    }
  );
  const [isSaving, setIsSaving] = useState(false);

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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      onUpdate(formData);
      onClose();
    } catch (error) {
      // Error handling connected to logging service
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {isOpen && <ModalBackdrop onClick={onClose} />}

      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto pointer-events-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-[#d9d9d9] px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#212b36] font-poppins">
              Edit {formData.firstName} {formData.lastName}
            </h2>
            <button
              onClick={onClose}
              disabled={isSaving}
              className="text-[#637381] hover:text-[#212b36] transition-colors disabled:opacity-50 font-poppins text-xl"
            >
              ×
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Patient Info Section */}
            <div className="space-y-3">
              <div className="bg-[#f4f5f7] border-b border-[#d9d9d9] py-2 px-3 mb-3">
                <h3 className="text-base font-medium text-[#212b36] font-poppins">Patient Info</h3>
              </div>

              <div className="space-y-3">
                {/* Full Width Fields */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[#b1b9c0] font-poppins">LGA</label>
                  <input
                    type="text"
                    value={formData.lga}
                    onChange={(e) => handleInputChange('lga', e.target.value)}
                    className="w-full h-12 px-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins focus:outline-none focus:border-[#2c7be5] transition-colors"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Select Community</label>
                  <input
                    type="text"
                    value={formData.community}
                    onChange={(e) => handleInputChange('community', e.target.value)}
                    className="w-full h-12 px-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins focus:outline-none focus:border-[#2c7be5] transition-colors"
                    disabled={isSaving}
                  />
                </div>

                {/* Two Column Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#b1b9c0] font-poppins">First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full h-12 px-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins focus:outline-none focus:border-[#2c7be5] transition-colors"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full h-12 px-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins focus:outline-none focus:border-[#2c7be5] transition-colors"
                      disabled={isSaving}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Age</label>
                    <input
                      type="text"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      className="w-full h-12 px-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins focus:outline-none focus:border-[#2c7be5] transition-colors"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full h-12 px-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins focus:outline-none focus:border-[#2c7be5] transition-colors"
                      disabled={isSaving}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="w-full h-12 px-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins focus:outline-none focus:border-[#2c7be5] transition-colors"
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

            {/* Test Details Section */}
            {testDetails && (
              <div className="space-y-3">
                <div className="bg-[#f4f5f7] border-b border-[#d9d9d9] py-2 px-3 mb-3">
                  <h3 className="text-base font-medium text-[#212b36] font-poppins">Test Details</h3>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Test Type</label>
                    <input
                      type="text"
                      value={testData.testType}
                      onChange={(e) => handleTestInputChange('testType', e.target.value)}
                      className="w-full h-12 px-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins focus:outline-none focus:border-[#2c7be5] transition-colors"
                      disabled={isSaving}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Test Result</label>
                      <input
                        type="text"
                        value={testData.testResult}
                        onChange={(e) => handleTestInputChange('testResult', e.target.value)}
                        className="w-full h-12 px-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins focus:outline-none focus:border-[#2c7be5] transition-colors"
                        disabled={isSaving}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Date Conducted</label>
                      <input
                        type="date"
                        value={testData.dateConducted}
                        onChange={(e) => handleTestInputChange('dateConducted', e.target.value)}
                        className="w-full h-12 px-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins focus:outline-none focus:border-[#2c7be5] transition-colors"
                        disabled={isSaving}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Officer Note</label>
                    <textarea
                      value={testData.officerNote}
                      onChange={(e) => handleTestInputChange('officerNote', e.target.value)}
                      className="w-full p-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins focus:outline-none focus:border-[#2c7be5] transition-colors resize-none h-24"
                      disabled={isSaving}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Update Button */}
          <div className="sticky bottom-0 bg-white border-t border-[#d9d9d9] px-6 py-4 flex justify-end gap-3">
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
