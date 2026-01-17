import { useState, useEffect } from 'react';
import api from '@/lib/api/index';
import { Patient } from '@/lib/constants/patients-data';

export function usePatientSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
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
            
            return {
              id: typeof p._id === 'number' ? p._id : (typeof p.id === 'number' ? p.id : index + 1),
              name: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim(),
              age: typeof p.age === 'string' ? p.age : `${p.age || 0}yrs`,
              gender: p.gender || 'Unknown',
              community: communityName,
              lga: lgaName,
              testsTaken: p.testsTaken || p.tests?.length || 0,
              lastTestResult: p.lastTestResult || p.tests?.[0]?.result || 'N/A',
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
    };
    fetchPatients();
  }, []);

  // Filter patients when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPatients(allPatients);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = allPatients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(query) ||
        patient.community.toLowerCase().includes(query) ||
        patient.lga.toLowerCase().includes(query)
    );
    setFilteredPatients(filtered);
  }, [searchQuery, allPatients]);

  const handleSearch = () => {
    // Search is already reactive via useEffect above
    // This function can be used for explicit search button clicks
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
