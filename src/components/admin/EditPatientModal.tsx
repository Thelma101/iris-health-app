'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toISODateFormat, toDisplayDateFormat, normalizeAge } from '@/lib/utils/validation';
import { calculateBMI, classifyBloodPressure, getBMICategoryColor, getBPCategoryColor } from '@/lib/utils/bmiCalculator';

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
  lastTestType?: string;
}

interface TestDetails {
  testType: string;
  testResult: string;
  dateConducted: string;
  editedDate: string;
  officerNote: string;
  // Health metrics
  heightCm?: number;
  weightKg?: number;
  bmi?: number;
  bmiCategory?: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  bpCategory?: string;
  glucoseLevel?: number;
  glucoseUnit?: string;
}

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedPatient: PatientData, updatedTestDetails?: TestDetails) => Promise<void> | void;
  patient: PatientData;
  testDetails?: TestDetails;
}

export default function EditPatientModal({
  isOpen,
  onClose,
  onUpdate,
  patient,
  testDetails,
}: EditPatientModalProps) {
  // Convert a date string to datetime-local format (YYYY-MM-DDTHH:MM)
  const toDateTimeLocal = (dateStr: string): string => {
    if (!dateStr || dateStr === 'N/A' || dateStr === '-') return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return toISODateFormat(dateStr);
      return d.toISOString().slice(0, 16);
    } catch {
      return toISODateFormat(dateStr);
    }
  };

  const [formData, setFormData] = useState<PatientData>(patient);
  const [testData, setTestData] = useState<TestDetails>(() => ({
    testType: testDetails?.testType || '',
    testResult: testDetails?.testResult || '',
    dateConducted: toDateTimeLocal(testDetails?.dateConducted || ''),
    editedDate: new Date().toISOString().slice(0, 16),
    officerNote: testDetails?.officerNote || '',
    heightCm: testDetails?.heightCm,
    weightKg: testDetails?.weightKg,
    bmi: testDetails?.bmi,
    bmiCategory: testDetails?.bmiCategory,
    bloodPressureSystolic: testDetails?.bloodPressureSystolic,
    bloodPressureDiastolic: testDetails?.bloodPressureDiastolic,
    bpCategory: testDetails?.bpCategory,
    glucoseLevel: testDetails?.glucoseLevel,
    glucoseUnit: testDetails?.glucoseUnit || 'mg/dL',
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
        dateConducted: toDateTimeLocal(testDetails.dateConducted),
        editedDate: new Date().toISOString().slice(0, 16),
      });
    }
  }, [testDetails]);

  // Auto-calculate BMI
  const bmiResult = useMemo(() => {
    const h = testData.heightCm ? testData.heightCm : null;
    const w = testData.weightKg ? testData.weightKg : null;
    return calculateBMI(w, h);
  }, [testData.heightCm, testData.weightKg]);

  // Auto-classify BP
  const bpCategory = useMemo(() => {
    return classifyBloodPressure(testData.bloodPressureSystolic ?? null, testData.bloodPressureDiastolic ?? null);
  }, [testData.bloodPressureSystolic, testData.bloodPressureDiastolic]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof PatientData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTestInputChange = (field: keyof TestDetails, value: string) => {
    setTestData((prev) => ({ ...prev, [field]: value }));
  };

  const handleHealthMetricChange = (field: keyof TestDetails, value: string) => {
    const numVal = value === '' ? undefined : parseFloat(value);
    setTestData((prev) => ({ ...prev, [field]: numVal }));
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      await onUpdate(formData, testData);
    } catch (error) {
      console.error('Error updating patient:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <button className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] cursor-pointer" onClick={onClose} aria-label="Close modal" />

      <div className="fixed right-0 top-0 h-screen w-full sm:w-[500px] bg-white z-50 flex flex-col overflow-hidden shadow-xl">
          {/* Header */}
          <div className="bg-white border-b border-[#d9d9d9] h-12 flex items-center justify-between px-[22px] flex-shrink-0">
            <h2 className="text-lg font-semibold text-[#212b36] font-poppins">
              Edit {formData.firstName} {formData.lastName}
            </h2>
            <button
              onClick={onClose}
              disabled={isSaving}
              className="text-[#637381] hover:text-[#212b36] transition-colors disabled:opacity-50"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                  <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Community</label>
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

            {/* Health Metrics Section (Editable) */}
            <div className="space-y-3">
              <div className="bg-[#f4f5f7] border-b border-[#d9d9d9] py-2 px-3 mb-3">
                <h3 className="text-base font-medium text-[#212b36] font-poppins">Health Metrics</h3>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Height (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="300"
                      value={testData.heightCm ?? ''}
                      onChange={(e) => handleHealthMetricChange('heightCm', e.target.value)}
                      placeholder="e.g. 170"
                      className="w-full h-12 px-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins focus:outline-none focus:border-[#2c7be5] transition-colors"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="500"
                      value={testData.weightKg ?? ''}
                      onChange={(e) => handleHealthMetricChange('weightKg', e.target.value)}
                      placeholder="e.g. 70"
                      className="w-full h-12 px-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins focus:outline-none focus:border-[#2c7be5] transition-colors"
                      disabled={isSaving}
                    />
                  </div>
                </div>

                {bmiResult && (
                  <div className="flex items-center gap-3 p-3 rounded border border-[#d9d9d9] bg-gray-50">
                    <span className="text-sm font-medium text-[#637381] font-poppins">BMI:</span>
                    <span className="text-sm font-semibold text-[#212b36] font-poppins">{bmiResult.bmi}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getBMICategoryColor(bmiResult.category)}`}>
                      {bmiResult.category}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#b1b9c0] font-poppins">BP Systolic</label>
                    <input
                      type="number"
                      min="0"
                      max="300"
                      value={testData.bloodPressureSystolic ?? ''}
                      onChange={(e) => handleHealthMetricChange('bloodPressureSystolic', e.target.value)}
                      placeholder="e.g. 120"
                      className="w-full h-12 px-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins focus:outline-none focus:border-[#2c7be5] transition-colors"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#b1b9c0] font-poppins">BP Diastolic</label>
                    <input
                      type="number"
                      min="0"
                      max="200"
                      value={testData.bloodPressureDiastolic ?? ''}
                      onChange={(e) => handleHealthMetricChange('bloodPressureDiastolic', e.target.value)}
                      placeholder="e.g. 80"
                      className="w-full h-12 px-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins focus:outline-none focus:border-[#2c7be5] transition-colors"
                      disabled={isSaving}
                    />
                  </div>
                </div>

                {bpCategory && (
                  <div className="flex items-center gap-3 p-3 rounded border border-[#d9d9d9] bg-gray-50">
                    <span className="text-sm font-medium text-[#637381] font-poppins">Blood Pressure:</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${getBPCategoryColor(bpCategory)}`}>
                      {bpCategory}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Glucose Level</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={testData.glucoseLevel ?? ''}
                      onChange={(e) => handleHealthMetricChange('glucoseLevel', e.target.value)}
                      placeholder="e.g. 95"
                      className="w-full h-12 px-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins focus:outline-none focus:border-[#2c7be5] transition-colors"
                      disabled={isSaving}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Glucose Unit</label>
                    <select
                      value={testData.glucoseUnit || 'mg/dL'}
                      onChange={(e) => setTestData((prev) => ({ ...prev, glucoseUnit: e.target.value }))}
                      className="w-full h-12 px-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins focus:outline-none focus:border-[#2c7be5] transition-colors"
                      disabled={isSaving}
                    >
                      <option value="mg/dL">mg/dL</option>
                      <option value="mmol/L">mmol/L</option>
                    </select>
                  </div>
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
                        placeholder="Enter test result"
                        className="w-full h-12 px-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins focus:outline-none focus:border-[#2c7be5] transition-colors"
                        disabled={isSaving}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Date Conducted</label>
                      <input
                        type="datetime-local"
                        value={testData.dateConducted}
                        readOnly
                        disabled
                        className="w-full h-12 px-3 border border-[#d9d9d9] rounded text-sm text-[#637381] font-poppins bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Updated Date</label>
                      <input
                        type="datetime-local"
                        value={testData.editedDate}
                        readOnly
                        disabled
                        className="w-full h-12 px-3 border border-[#d9d9d9] rounded text-sm text-[#637381] font-poppins bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#b1b9c0] font-poppins">Additional Notes</label>
                    <textarea
                      value={testData.officerNote}
                      onChange={(e) => handleTestInputChange('officerNote', e.target.value)}
                      className="w-full p-3 border border-[#d9d9d9] rounded text-sm text-[#212b36] font-poppins focus:outline-none focus:border-[#2c7be5] transition-colors min-h-[6rem] resize-none"
                      disabled={isSaving}
                      placeholder="Add additional notes..."
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
    </>
  );
}
