'use client';

import { useState } from 'react';

interface Community {
  _id: string;
  name: string;
}

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
}

interface TestRecordingFormProps {
  communities: Community[];
  patients: Patient[];
  onSubmit: (data: any) => void;
  loading: boolean;
}

const testTypes = [
  'HIV/AIDS',
  'Hepatitis B',
  'Hepatitis C',
  'Malaria',
  'Typhoid',
  'Diabetes',
  'Hypertension',
  'COVID-19',
  'TB',
  'Other',
];

export default function TestRecordingForm({
  communities,
  patients,
  onSubmit,
  loading,
}: TestRecordingFormProps) {
  const [formData, setFormData] = useState({
    communityId: '',
    patientId: '',
    testType: '',
    testResult: 'negative',
    notes: '',
    patientFirstName: '',
    patientLastName: '',
    patientAge: '',
    patientGender: 'male',
  });

  const [isNewPatient, setIsNewPatient] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: any = {
      community: formData.communityId,
      testType: formData.testType,
      testResult: formData.testResult,
      notes: formData.notes,
    };

    if (isNewPatient) {
      submitData.newPatient = {
        firstName: formData.patientFirstName,
        lastName: formData.patientLastName,
        age: parseInt(formData.patientAge),
        gender: formData.patientGender,
      };
    } else {
      submitData.patient = formData.patientId;
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl">
      {/* Community Selection */}
      <div className="flex flex-col gap-1.5">
        <label className="font-poppins font-medium text-sm text-[#637381]">
          Community *
        </label>
        <select
          name="communityId"
          value={formData.communityId}
          onChange={handleChange}
          required
          className="h-12 px-4 bg-white border border-[#d9d9d9] rounded font-poppins text-sm text-[#212b36] focus:outline-none focus:border-[#2c7be5]"
        >
          <option value="">Select a community</option>
          {communities.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Patient Selection Toggle */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={!isNewPatient}
            onChange={() => setIsNewPatient(false)}
            className="w-4 h-4 text-[#2c7be5]"
          />
          <span className="font-poppins text-sm text-[#212b36]">Existing Patient</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={isNewPatient}
            onChange={() => setIsNewPatient(true)}
            className="w-4 h-4 text-[#2c7be5]"
          />
          <span className="font-poppins text-sm text-[#212b36]">New Patient</span>
        </label>
      </div>

      {/* Existing Patient Selection */}
      {!isNewPatient && (
        <div className="flex flex-col gap-1.5">
          <label className="font-poppins font-medium text-sm text-[#637381]">
            Select Patient *
          </label>
          <select
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            required={!isNewPatient}
            className="h-12 px-4 bg-white border border-[#d9d9d9] rounded font-poppins text-sm text-[#212b36] focus:outline-none focus:border-[#2c7be5]"
          >
            <option value="">Select a patient</option>
            {patients.map(p => (
              <option key={p._id} value={p._id}>
                {p.firstName} {p.lastName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* New Patient Fields */}
      {isNewPatient && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#f4f5f7] rounded-lg">
          <div className="flex flex-col gap-1.5">
            <label className="font-poppins font-medium text-sm text-[#637381]">
              First Name *
            </label>
            <input
              type="text"
              name="patientFirstName"
              value={formData.patientFirstName}
              onChange={handleChange}
              required={isNewPatient}
              className="h-12 px-4 bg-white border border-[#d9d9d9] rounded font-poppins text-sm focus:outline-none focus:border-[#2c7be5]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-poppins font-medium text-sm text-[#637381]">
              Last Name *
            </label>
            <input
              type="text"
              name="patientLastName"
              value={formData.patientLastName}
              onChange={handleChange}
              required={isNewPatient}
              className="h-12 px-4 bg-white border border-[#d9d9d9] rounded font-poppins text-sm focus:outline-none focus:border-[#2c7be5]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-poppins font-medium text-sm text-[#637381]">
              Age *
            </label>
            <input
              type="number"
              name="patientAge"
              value={formData.patientAge}
              onChange={handleChange}
              required={isNewPatient}
              min="0"
              max="150"
              className="h-12 px-4 bg-white border border-[#d9d9d9] rounded font-poppins text-sm focus:outline-none focus:border-[#2c7be5]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="font-poppins font-medium text-sm text-[#637381]">
              Gender *
            </label>
            <select
              name="patientGender"
              value={formData.patientGender}
              onChange={handleChange}
              required={isNewPatient}
              className="h-12 px-4 bg-white border border-[#d9d9d9] rounded font-poppins text-sm text-[#212b36] focus:outline-none focus:border-[#2c7be5]"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      )}

      {/* Test Type */}
      <div className="flex flex-col gap-1.5">
        <label className="font-poppins font-medium text-sm text-[#637381]">
          Test Type *
        </label>
        <select
          name="testType"
          value={formData.testType}
          onChange={handleChange}
          required
          className="h-12 px-4 bg-white border border-[#d9d9d9] rounded font-poppins text-sm text-[#212b36] focus:outline-none focus:border-[#2c7be5]"
        >
          <option value="">Select test type</option>
          {testTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Test Result */}
      <div className="flex flex-col gap-1.5">
        <label className="font-poppins font-medium text-sm text-[#637381]">
          Test Result *
        </label>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="testResult"
              value="positive"
              checked={formData.testResult === 'positive'}
              onChange={handleChange}
              className="w-4 h-4 text-[#d64545]"
            />
            <span className="font-poppins text-sm text-[#d64545]">Positive</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="testResult"
              value="negative"
              checked={formData.testResult === 'negative'}
              onChange={handleChange}
              className="w-4 h-4 text-green-600"
            />
            <span className="font-poppins text-sm text-green-600">Negative</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="testResult"
              value="inconclusive"
              checked={formData.testResult === 'inconclusive'}
              onChange={handleChange}
              className="w-4 h-4 text-yellow-600"
            />
            <span className="font-poppins text-sm text-yellow-600">Inconclusive</span>
          </label>
        </div>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label className="font-poppins font-medium text-sm text-[#637381]">
          Notes (Optional)
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          className="px-4 py-3 bg-white border border-[#d9d9d9] rounded font-poppins text-sm focus:outline-none focus:border-[#2c7be5] resize-none"
          placeholder="Additional notes about the test..."
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="h-12 bg-[#2c7be5] text-white rounded-[10px] font-inter font-medium text-base hover:bg-[#1e5aa8] transition-colors disabled:opacity-50"
      >
        {loading ? 'Recording...' : 'Record Test'}
      </button>
    </form>
  );
}
