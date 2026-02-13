'use client';

import React, { useState, useEffect } from 'react';
import PatientsHeader from '@/components/admin/view-patients/PatientsHeader';
import SearchBar from '@/components/admin/view-patients/SearchBar';
import FilterBar from '@/components/admin/view-patients/FilterBar';
import PatientsTable from '@/components/admin/view-patients/PatientsTable';
import PatientDetailsModal from '@/components/admin/PatientDetailsModal';
import EditPatientModal from '@/components/admin/EditPatientModal';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { usePatientSearch } from '@/hooks/usePatientSearch';
import { Patient } from '@/lib/constants/patients-data';
import api from '@/lib/api';

export default function ViewPatientsPage() {
  const { searchQuery, setSearchQuery, selectedDate, setSelectedDate, selectedCommunity, setSelectedCommunity, filteredPatients, handleSearch, handleExport, loading, error, refetch, pagination, goToPage, currentPage } = usePatientSearch();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Test type lookup map (ObjectId -> name)
  const [testTypeMap, setTestTypeMap] = useState<Record<string, string>>({});

  // Community list for filter dropdown
  const [communities, setCommunities] = useState<{ value: string; label: string }[]>([]);

  // Fetch communities for filter
  useEffect(() => {
    api.getCommunities()
      .then((res) => {
        if (res.success && res.data) {
          const comData = res.data as any;
          const comArray = comData?.communities || comData?.data?.communities || [];
          setCommunities(comArray.map((c: any) => ({ value: c._id, label: c.name })));
        }
      })
      .catch((err) => console.error('Error fetching communities:', err));
  }, []);

  // Fetch test types for ID-to-name resolution
  useEffect(() => {
    api.getTestTypes()
      .then((res) => {
        if (res.success && res.data) {
          const testData = res.data as any;
          const testTypesArray = testData?.data?.testTypes || testData?.testTypes || [];
          const map: Record<string, string> = {};
          testTypesArray.forEach((tt: any) => {
            map[tt._id] = tt.name;
          });
          setTestTypeMap(map);
        }
      })
      .catch((err) => console.error('Error fetching test types:', err));
  }, []);

  // Helper to resolve testType (ObjectId or name) to display name
  const resolveTestTypeName = (testType: any): string => {
    if (!testType) return 'N/A';
    // If it's an object with name property (populated)
    if (typeof testType === 'object' && testType?.name) return testType.name;
    // If it's a string, check if it's an ObjectId (24 hex chars) and lookup
    if (typeof testType === 'string') {
      const isObjectId = /^[a-fA-F0-9]{24}$/.test(testType);
      if (isObjectId && testTypeMap[testType]) {
        return testTypeMap[testType];
      }
      // Otherwise return as-is (might already be a name)
      return testType;
    }
    return 'N/A';
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const handleEditPatient = (patient: Patient) => {
    // Get latest test details from patient data
    const latestTest = patient.testDetails && patient.testDetails.length > 0 
      ? patient.testDetails[patient.testDetails.length - 1] 
      : null;
    
    setEditingPatient({
      id: patient._id || patient.id || '', // Use MongoDB ObjectId
      name: patient.name,
      lga: patient.lga,
      community: patient.community,
      firstName: patient.name.split(' ')[0],
      lastName: patient.name.split(' ')[1] || '',
      age: patient.age,
      gender: patient.gender,
      phoneNumber: patient.phoneNumber || patient.phone || '',
      testsTaken: patient.testsTaken,
      lastTestType: patient.lastTestType,
      testDetails: patient.testDetails || [],
      latestTest: latestTest,
      testSheetUrl: latestTest?.testSheetUrl || patient.testSheetUrl || '',
      patientImageUrl: latestTest?.patientImageUrl || patient.patientImageUrl || '',
    });
    setShowEditModal(true);
  };

  const handleUpdatePatient = async (updatedPatient: any, updatedTestDetails?: any) => {
    setActionLoading(true);
    setErrorMessage(null);
    try {
      // Use the MongoDB _id for the API call
      const patientId = updatedPatient.id;
      
      if (!patientId || patientId === '' || typeof patientId === 'number') {
        setErrorMessage('Invalid patient ID. Cannot update patient.');
        setTimeout(() => setErrorMessage(null), 5000);
        setActionLoading(false);
        return;
      }

      // Prepare the update payload with proper field mapping
      const updatePayload: any = {
        firstName: updatedPatient.firstName,
        lastName: updatedPatient.lastName,
        age: typeof updatedPatient.age === 'string' 
          ? parseInt(updatedPatient.age.replace(/\D/g, '')) || 0 
          : updatedPatient.age,
        gender: updatedPatient.gender?.toLowerCase(),
        phone: updatedPatient.phoneNumber,
      };

      // Include test details if provided and there's a latest test to update
      if (updatedTestDetails && editingPatient?.testDetails?.length > 0) {
        // Find the index of the latest test to update
        const latestTestIndex = editingPatient.testDetails.length - 1;
        const existingTests = [...editingPatient.testDetails];
        const existingTest = existingTests[latestTestIndex];
        
        // Update the latest test with new details, explicitly preserving _id
        existingTests[latestTestIndex] = {
          _id: existingTest._id, // Required for update
          testType: updatedTestDetails.testType,
          testResult: updatedTestDetails.testResult,
          dateConducted: updatedTestDetails.dateConducted,
          officerNotes: updatedTestDetails.officerNote,
          testSheetUrl: existingTest.testSheetUrl || '',
          patientImageUrl: existingTest.patientImageUrl || '',
          // Health metrics
          heightCm: updatedTestDetails.heightCm,
          weightKg: updatedTestDetails.weightKg,
          bmi: updatedTestDetails.bmi,
          bmiCategory: updatedTestDetails.bmiCategory,
          bloodPressureSystolic: updatedTestDetails.bloodPressureSystolic,
          bloodPressureDiastolic: updatedTestDetails.bloodPressureDiastolic,
          bpCategory: updatedTestDetails.bpCategory,
          glucoseLevel: updatedTestDetails.glucoseLevel,
          glucoseUnit: updatedTestDetails.glucoseUnit,
        };
        
        updatePayload.testDetails = existingTests;
      }

      const res = await api.updatePatient(patientId, updatePayload);
      if (res.success) {
        setSuccessMessage('Patient updated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
        // Refresh the patient list to show updated data
        await refetch();
      } else {
        setErrorMessage(res.error || 'Failed to update patient');
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update patient';
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setActionLoading(false);
      setShowEditModal(false);
      setEditingPatient(null);
    }
  };

  const handleDownloadPatientDetails = () => {
    if (!selectedPatient) return;
    const headers = ['Name', 'Age', 'Gender', 'Community', 'LGA', 'Tests Taken', 'Last Test Type'];
    const values = [
      selectedPatient.name,
      selectedPatient.age,
      selectedPatient.gender,
      selectedPatient.community,
      selectedPatient.lga,
      String(selectedPatient.testsTaken ?? ''),
      selectedPatient.lastTestType ?? '',
    ].map(v => `"${String(v).replace(/"/g, '""')}"`);
    const csvContent = [headers.join(','), values.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient-${selectedPatient.name.replace(/\s+/g, '-')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <main className="bg-white border border-[#d9d9d9] border-r-0 rounded-bl-[20px] rounded-tl-[20px] w-full min-h-[calc(100vh-93px)] p-4 sm:p-6 pb-2 sm:pb-3 space-y-3 sm:space-y-4">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {errorMessage}
        </div>
      )}

      {/* Loading Overlay */}
      {actionLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-40">
          <LoadingSpinner />
        </div>
      )}

      {/* Header */}
      <PatientsHeader />

      {/* Search and Filter Section - Desktop: Search + Search btn | Date + Export; Mobile: Search + Export + Date */}
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Desktop layout: Search on left, filters on right */}
        <div className="hidden sm:flex sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} onSearch={handleSearch} />
          <FilterBar
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onExport={() => handleExport(selectedDate)}
            communities={communities}
            selectedCommunity={selectedCommunity}
            onCommunityChange={setSelectedCommunity}
          />
        </div>
        
        {/* Mobile layout: Search bar + Export + Date picker */}
        <div className="flex sm:hidden flex-col gap-3">
          {/* Search bar for mobile - no search button */}
          <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} onSearch={handleSearch} hideSearchButton />
          {/* Export and Date with space-between */}
          <FilterBar
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onExport={() => handleExport(selectedDate)}
            className="justify-between"
            communities={communities}
            selectedCommunity={selectedCommunity}
            onCommunityChange={setSelectedCommunity}
          />
        </div>
      </div>

      {/* Patients Count */}
      <div className="text-sm text-[#637381] font-poppins">
        Total: {pagination ? pagination.total : filteredPatients.length}
        {selectedCommunity && communities.length > 0 && (
          <span className="ml-2 text-[#2c7be5]">
            ({communities.find(c => c.value === selectedCommunity)?.label})
          </span>
        )}
      </div>

      {/* Patients Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">{error}</div>
      ) : (
        <PatientsTable
          patients={filteredPatients}
          onViewPatient={handleViewPatient}
          onEditPatient={handleEditPatient}
        />
      )}

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentPage <= 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-[#d9d9d9] text-[#637381] hover:border-[#2c7be5] hover:text-[#2c7be5] cursor-pointer'
            }`}
          >
            Previous
          </button>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - currentPage) <= 2)
            .map((p, idx, arr) => (
              <React.Fragment key={p}>
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span className="text-[#637381] text-sm">...</span>
                )}
                <button
                  onClick={() => goToPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    p === currentPage
                      ? 'bg-[#2c7be5] text-white'
                      : 'bg-white border border-[#d9d9d9] text-[#637381] hover:border-[#2c7be5] hover:text-[#2c7be5]'
                  }`}
                >
                  {p}
                </button>
              </React.Fragment>
            ))}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= pagination.totalPages}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentPage >= pagination.totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-[#d9d9d9] text-[#637381] hover:border-[#2c7be5] hover:text-[#2c7be5] cursor-pointer'
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Patient Details Modal */}
      {selectedPatient && (
        <PatientDetailsModal
          isOpen={showPatientModal}
          onClose={() => {
            setShowPatientModal(false);
            setSelectedPatient(null);
          }}
          patient={{
            name: selectedPatient.name,
            lga: selectedPatient.lga,
            community: selectedPatient.community,
            firstName: selectedPatient.name.split(' ')[0],
            lastName: selectedPatient.name.split(' ')[1] || '',
            age: selectedPatient.age,
            gender: selectedPatient.gender,
            phoneNumber: selectedPatient.phoneNumber || selectedPatient.phone || '',
          }}
          testDetails={(() => {
            const latestTest = selectedPatient.testDetails && selectedPatient.testDetails.length > 0
              ? selectedPatient.testDetails[selectedPatient.testDetails.length - 1]
              : null;
            return {
              testType: resolveTestTypeName(latestTest?.testType),
              testResult: latestTest?.testResult || selectedPatient.lastTestType || 'N/A',
              dateConducted: latestTest?.dateConducted 
                ? new Date(latestTest.dateConducted).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                : 'N/A',
              officerNote: latestTest?.officerNotes || '',
              // Health metrics
              heightCm: latestTest?.heightCm,
              weightKg: latestTest?.weightKg,
              bmi: latestTest?.bmi,
              bmiCategory: latestTest?.bmiCategory,
              bloodPressureSystolic: latestTest?.bloodPressureSystolic,
              bloodPressureDiastolic: latestTest?.bloodPressureDiastolic,
              bpCategory: latestTest?.bpCategory,
              glucoseLevel: latestTest?.glucoseLevel,
              glucoseUnit: latestTest?.glucoseUnit,
            };
          })()}
          onDownload={handleDownloadPatientDetails}
        />
      )}

      {/* Edit Patient Modal */}
      {editingPatient && (
        <EditPatientModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingPatient(null);
          }}
          patient={editingPatient}
          onUpdate={handleUpdatePatient}
          testDetails={(() => {
            const latestTest = editingPatient.latestTest;
            return {
              testType: resolveTestTypeName(latestTest?.testType),
              testResult: latestTest?.testResult || editingPatient.lastTestType || 'N/A',
              dateConducted: latestTest?.dateConducted 
                ? new Date(latestTest.dateConducted).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                : 'N/A',
              officerNote: latestTest?.officerNotes || '',
              editedDate: new Date().toISOString().slice(0, 16),
              // Health metrics
              heightCm: latestTest?.heightCm,
              weightKg: latestTest?.weightKg,
              bmi: latestTest?.bmi,
              bmiCategory: latestTest?.bmiCategory,
              bloodPressureSystolic: latestTest?.bloodPressureSystolic,
              bloodPressureDiastolic: latestTest?.bloodPressureDiastolic,
              bpCategory: latestTest?.bpCategory,
              glucoseLevel: latestTest?.glucoseLevel,
              glucoseUnit: latestTest?.glucoseUnit,
            };
          })()}
        />
      )}
    </main>
  );
}
