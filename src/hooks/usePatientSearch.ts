import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api/index';
import { Patient } from '@/lib/constants/patients-data';

// Get today's date in DD/MM/YYYY format
const getTodayFormatted = () => {
  const today = new Date();
  return `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
};

export function usePatientSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayFormatted); // DD/MM/YYYY format
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getPatients();

      // Handle different response structures
      const patients = (res.data as any)?.patients || res.data;

      if (res.success && Array.isArray(patients) && patients.length > 0) {
        // Map API response to Patient type
        const mappedPatients: Patient[] = patients.map((p: any, index: number) => {
          // Handle community - it may be a string or an object with {_id, name, lga}
          const communityName = typeof p.community === 'object' && p.community !== null
            ? (p.community.name || 'Unknown')
            : (p.community || 'Unknown');

          // Handle LGA - it may come from community object or directly
          const lgaName = typeof p.community === 'object' && p.community !== null && p.community.lga
            ? p.community.lga
            : (p.lga || 'Unknown');

          // Get latest test details
          const testDetails = p.testDetails || [];
          const latestTest = testDetails.length > 0 ? testDetails[testDetails.length - 1] : null;

          return {
            id: typeof p._id === 'number' ? p._id : (typeof p.id === 'number' ? p.id : index + 1),
            _id: p._id || p.id, // Store the actual MongoDB ObjectId
            name: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
            age: typeof p.age === 'string' ? p.age : `${p.age || 0}yrs`,
            gender: p.gender || 'Unknown',
            community: communityName,
            lga: lgaName,
            testsTaken: p.numberOfTests || p.testsTaken || testDetails.length || 0,
            lastTestResult: latestTest?.testResult || p.lastTestResult || 'N/A',
            phoneNumber: p.phone || p.phoneNumber,
            phone: p.phone || p.phoneNumber,
            testDetails: testDetails.map((t: any) => ({
              _id: t._id || '', // Required for updates
              testType: typeof t.testType === 'object' ? t.testType?.name || '' : t.testType || '',
              testResult: t.testResult || '',
              dateConducted: t.dateConducted || '',
              officerNotes: t.officerNotes || '',
              testSheetUrl: t.testSheetUrl || '',
              patientImageUrl: t.patientImageUrl || '',
            })),
            testSheetUrl: latestTest?.testSheetUrl || '',
            patientImageUrl: latestTest?.patientImageUrl || '',
          };
        });
        setAllPatients(mappedPatients);
        setFilteredPatients(mappedPatients);
      } else {
        // No data available
        setAllPatients([]);
        setFilteredPatients([]);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err instanceof Error ? err.message : 'Failed to load patients');
      setAllPatients([]);
      setFilteredPatients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch patients on mount
  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Filter patients when search query or date changes
  useEffect(() => {
    let filtered = allPatients;

    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (patient) =>
          patient.name.toLowerCase().includes(query) ||
          patient.community.toLowerCase().includes(query) ||
          patient.lga.toLowerCase().includes(query)
      );
    }

    // Apply date filter - show patients with tests on or before selected date
    if (selectedDate) {
      // Convert DD/MM/YYYY to ISO date for comparison
      const parts = selectedDate.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        const fullYear = year.length === 2 ? `20${year}` : year;
        const filterDateStr = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        
        filtered = filtered.filter((patient) => {
          // Check if any test was conducted on or before the selected date
          if (!patient.testDetails || patient.testDetails.length === 0) {
            // Include patients without tests - they might have been registered before the date
            return true;
          }
          return patient.testDetails.some((test) => {
            if (!test.dateConducted) return true; // Include tests without date
            const testDate = new Date(test.dateConducted).toISOString().split('T')[0];
            return testDate <= filterDateStr;
          });
        });
      }
    }

    setFilteredPatients(filtered);
  }, [searchQuery, selectedDate, allPatients]);

  const handleSearch = () => {};

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
    selectedDate,
    setSelectedDate,
    filteredPatients,
    handleSearch,
    handleExport,
    loading,
    error,
    refetch: fetchPatients,
  };
}
