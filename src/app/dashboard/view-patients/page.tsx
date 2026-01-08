'use client';

import React, { useState } from 'react';
import PatientsHeader from '@/components/view-patients/PatientsHeader';
import SearchBar from '@/components/view-patients/SearchBar';
import FilterBar from '@/components/view-patients/FilterBar';
import PatientsTable from '@/components/view-patients/PatientsTable';
import PatientDetailsModal from '@/components/ui/PatientDetailsModal';
import EditPatientModal from '@/components/ui/EditPatientModal';
import { usePatientSearch } from '@/hooks/usePatientSearch';
import { Patient } from '@/lib/constants/patients-data';

export default function ViewPatientsPage() {
  const [selectedDate, setSelectedDate] = useState('02/10/25');
  const { searchQuery, setSearchQuery, filteredPatients, handleSearch, handleExport } = usePatientSearch();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);

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

  const handleUpdatePatient = (updatedPatient: any) => {
    // Connect to patient database service
  };

  const handleDownloadPatientDetails = () => {
    // Connect to patient export service
  };

  return (
    <main className="space-y-4 sm:space-y-6">
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
      <PatientsTable 
        patients={filteredPatients}
        onViewPatient={handleViewPatient}
        onEditPatient={handleEditPatient}
      />

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
