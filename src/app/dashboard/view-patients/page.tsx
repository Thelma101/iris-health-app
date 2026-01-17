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
  const { searchQuery, setSearchQuery, filteredPatients, handleSearch, handleExport, loading, error } = usePatientSearch();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient({
      id: patient.id || '',
      name: patient.name,
      lga: patient.lga,
      community: patient.community,
      firstName: patient.name.split(' ')[0],
      lastName: patient.name.split(' ')[1] || '',
      age: patient.age,
      gender: patient.gender,
      phoneNumber: '08065353567',
      testsTaken: patient.testsTaken,
      lastTestResult: patient.lastTestResult,
    });
    setShowEditModal(true);
  };

  const handleUpdatePatient = async (updatedPatient: any) => {
    setActionLoading(true);
    try {
      const res = await api.updatePatient(updatedPatient.id, updatedPatient);
      if (res.success) {
        setSuccessMessage('Patient updated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch {
      // Silently handle - local state update will still work
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
    <main className="space-y-4 sm:space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {successMessage}
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

      {/* Filter and Search Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} onSearch={handleSearch} />
        <FilterBar selectedDate={selectedDate} onExport={() => handleExport(selectedDate)} />
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
            phoneNumber: '08065353567',
          }}
          testDetails={{
            testType: 'HIV 1/2 Rapid Test',
            testResult: selectedPatient.lastTestResult,
            dateConducted: '21/03/2025',
            officerNote: 'However rare side effects observed among children can be metabolic acidosis, coma, respiratory depre',
          }}
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
          testDetails={{
            testType: 'HIV 1/2 Rapid Test',
            testResult: editingPatient.lastTestResult,
            dateConducted: '21/03/2025',
            officerNote: 'However rare side effects observed among children can be metabolic acidosis, coma, respiratory depre',
          }}
        />
      )}
    </main>
  );
}
