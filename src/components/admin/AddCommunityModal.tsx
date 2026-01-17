'use client';
import React, { useState } from 'react';

interface AddCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: { community: string; lga: string; fieldOfficers: string[] }) => void;
}

const fieldOfficersAvailable = ['Tope Barakat', 'Musa Mohammed', 'John Allah', 'Opeyemi Braka', 'Michael Tokunbo', 'Adekunle Ahmed'];

export default function AddCommunityModal({ isOpen, onClose, onSubmit }: AddCommunityModalProps) {
  const [formData, setFormData] = useState({
    community: '',
    lga: '',
    selectedOfficers: [] as string[],
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    
    // Validate required fields
    if (!formData.community.trim()) {
      setValidationError('Community name is required');
      return;
    }
    if (!formData.lga.trim()) {
      setValidationError('Local Government Area (LGA) is required');
      return;
    }
    
    onSubmit?.({
      community: formData.community,
      lga: formData.lga,
      fieldOfficers: formData.selectedOfficers,
    });
    // Reset form after successful submission (parent will close modal)
    setFormData({ community: '', lga: '', selectedOfficers: [] });
    // Note: Don't call onClose() here - let parent handle it after API response
  };

  const handleAddOfficer = (officer: string) => {
    if (!formData.selectedOfficers.includes(officer)) {
      setFormData({
        ...formData,
        selectedOfficers: [...formData.selectedOfficers, officer],
      });
    }
  };

  const handleRemoveOfficer = (officer: string) => {
    setFormData({
      ...formData,
      selectedOfficers: formData.selectedOfficers.filter((o) => o !== officer),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/20 backdrop-blur-[10px]"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[625px] bg-white rounded-[10px] shadow-lg">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#d9d9d9] px-4 sm:px-6 py-3 sm:py-4">
          <h2 className="text-lg sm:text-xl font-medium text-[#212b36] font-poppins">Add New Community</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-[#637381] hover:text-[#212b36] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          {/* Validation Error */}
          {validationError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-poppins">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {validationError}
            </div>
          )}
          <div className="space-y-6 sm:space-y-8">
            {/* Community Field */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-medium text-[#637381] font-poppins">
                Community <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.community}
                onChange={(e) => {
                  setFormData({ ...formData, community: e.target.value });
                  if (validationError) setValidationError(null);
                }}
                placeholder="Enter community name"
                className="w-full px-4 py-2.5 sm:py-3 border border-[#d9d9d9] rounded-[4px] text-sm sm:text-base text-[#212b36] font-poppins placeholder-[#999] bg-white hover:border-[#2c7be5] focus:outline-none focus:border-[#2c7be5] focus:ring-2 focus:ring-[#2c7be5]/10 transition-colors"
              />
            </div>

            {/* LGA Field */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-medium text-[#637381] font-poppins">
                LGA <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lga}
                onChange={(e) => {
                  setFormData({ ...formData, lga: e.target.value });
                  if (validationError) setValidationError(null);
                }}
                placeholder="Enter Local Government Area"
                className="w-full px-4 py-2.5 sm:py-3 border border-[#d9d9d9] rounded-[4px] text-sm sm:text-base text-[#212b36] font-poppins placeholder-[#999] bg-white hover:border-[#2c7be5] focus:outline-none focus:border-[#2c7be5] focus:ring-2 focus:ring-[#2c7be5]/10 transition-colors"
              />
            </div>

            {/* Field Officer Field - Multi-select */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-medium text-[#637381] font-poppins">
                Add Field Officer
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddOfficer(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full px-4 py-2.5 sm:py-3 border border-[#d9d9d9] rounded-[4px] text-sm sm:text-base text-[#212b36] font-poppins appearance-none bg-white cursor-pointer hover:border-[#2c7be5] focus:outline-none focus:border-[#2c7be5] focus:ring-2 focus:ring-[#2c7be5]/10 transition-colors"
                defaultValue=""
              >
                <option value="">Select field officer...</option>
                {fieldOfficersAvailable.map((officer) => (
                  <option key={officer} value={officer} disabled={formData.selectedOfficers.includes(officer)}>
                    {officer}
                  </option>
                ))}
              </select>

              {/* Selected Officers Tags */}
              {formData.selectedOfficers.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {formData.selectedOfficers.map((officer) => (
                    <div
                      key={officer}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-[#d9d9d9] rounded-full text-xs sm:text-sm text-[#637381] font-poppins"
                    >
                      <span>{officer}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveOfficer(officer)}
                        className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-gray-200 transition-colors"
                        aria-label={`Remove ${officer}`}
                      >
                        <svg className="w-3 h-3 text-[#637381]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full h-10 sm:h-12 bg-[#2c7be5] text-white text-sm sm:text-base font-medium rounded-[10px] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-[#2c7be5]/50 transition-colors font-poppins"
          >
            Add Community
          </button>
        </form>
      </div>
    </div>
  );
}
