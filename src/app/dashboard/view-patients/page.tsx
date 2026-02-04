'use client';

import React, { useState } from 'react';
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
  const [selectedDate, setSelectedDate] = useState('02/10/25');
  const { searchQuery, setSearchQuery, filteredPatients, handleSearch, handleExport, loading, error, refetch } = usePatientSearch();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      lastTestResult: patient.lastTestResult,
      testDetails: patient.testDetails || [],
      latestTest: latestTest,
      testSheetUrl: latestTest?.testSheetUrl || patient.testSheetUrl || '',
      patientImageUrl: latestTest?.patientImageUrl || patient.patientImageUrl || '',
    });
    setShowEditModal(true);
  };

  const handleUpdatePatient = async (updatedPatient: any) => {
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
      const updatePayload = {
        firstName: updatedPatient.firstName,
        lastName: updatedPatient.lastName,
        age: typeof updatedPatient.age === 'string' 
          ? parseInt(updatedPatient.age.replace(/\D/g, '')) || 0 
          : updatedPatient.age,
        gender: updatedPatient.gender?.toLowerCase(),
        phone: updatedPatient.phoneNumber,
      };

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
    const patientData = `Patient Details\n\nName: ${selectedPatient.name}\nAge: ${selectedPatient.age}\nGender: ${selectedPatient.gender}\nCommunity: ${selectedPatient.community}\nLGA: ${selectedPatient.lga}\nTests Taken: ${selectedPatient.testsTaken}\nLast Test Result: ${selectedPatient.lastTestResult}`;
    const blob = new Blob([patientData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient-${selectedPatient.name.replace(/\s+/g, '-')}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <main className="bg-white border border-[#d9d9d9] border-r-0 rounded-bl-[20px] rounded-tl-[20px] w-full min-h-[calc(100vh-93px)] p-4 sm:p-6 space-y-4 sm:space-y-6">
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
          />
        </div>
      </div>

      {/* Patients Count */}
      <div className="text-sm text-[#637381] font-poppins">Total: {filteredPatients.length}</div>

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
              testType: latestTest?.testType || 'N/A',
              testResult: latestTest?.testResult || selectedPatient.lastTestResult || 'N/A',
              dateConducted: latestTest?.dateConducted 
                ? new Date(latestTest.dateConducted).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                : 'N/A',
              officerNote: latestTest?.officerNotes || '',
              testSheetImage: latestTest?.testSheetUrl || selectedPatient.testSheetUrl || '',
            };
          })()}
          patientImage={(() => {
            const latestTest = selectedPatient.testDetails && selectedPatient.testDetails.length > 0
              ? selectedPatient.testDetails[selectedPatient.testDetails.length - 1]
              : null;
            return latestTest?.patientImageUrl || selectedPatient.patientImageUrl || '';
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
              testType: latestTest?.testType || 'N/A',
              testResult: latestTest?.testResult || editingPatient.lastTestResult || 'N/A',
              dateConducted: latestTest?.dateConducted 
                ? new Date(latestTest.dateConducted).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                : 'N/A',
              officerNote: latestTest?.officerNotes || '',
              testSheetImage: latestTest?.testSheetUrl || editingPatient.testSheetUrl || '',
            };
          })()}
          patientImage={editingPatient.patientImageUrl || ''}
        />
      )}
    </main>
  );
}
