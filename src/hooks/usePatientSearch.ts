import { useState, useEffect } from 'react';
import api from '@/lib/api/index';
import { Patient } from '@/lib/constants/patients-data';

export function usePatientSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setError(null);
      const res = await api.getPatients();
      if (res.success && Array.isArray(res.data)) {
        setFilteredPatients(res.data);
      } else {
        setError(res.error || 'Failed to fetch patients');
      }
      setLoading(false);
    };
    fetchPatients();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setFilteredPatients((prev) =>
        prev.filter(
          (patient) =>
            patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.community.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.lga.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      api.getPatients().then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setFilteredPatients(res.data);
        }
      });
    }
  };

  const handleExport = (selectedDate: string) => {
    const headers = ['Patient Name', 'Age', 'Gender', 'Community', 'LGA', 'Tests Taken', 'Last Test Result'];
    const csv = [
      headers.join(','),
      ...filteredPatients.map((patient) =>
        [patient.name, patient.age, patient.gender, patient.community, patient.lga, patient.testsTaken, patient.lastTestResult].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patients-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return {
    searchQuery,
    setSearchQuery,
    filteredPatients,
    handleSearch,
    handleExport,
    loading,
    error,
  };
}
