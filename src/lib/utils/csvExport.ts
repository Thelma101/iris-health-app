/**
 * CSV export utilities for analytics/report page
 */

function escapeCsvField(value: string | number | undefined | null): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadCsv(rows: string[][], filename: string) {
  const csvContent = rows.map(row => row.map(escapeCsvField).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface CommunityStatRow {
  name: string;
  lga: string;
  totalPatients: number;
  totalTests: number;
  positiveTests: number;
  negativeTests: number;
  assignedAgents: number;
  agentNames: string[];
}

/**
 * Export community summary table to CSV
 */
export function exportCommunitySummaryCsv(stats: CommunityStatRow[], filename?: string) {
  const headers = ['Community', 'LGA', 'Patients', 'Tests', 'Positive', 'Negative', 'Agents', 'Agent Names'];
  const rows = stats.map(s => [
    s.name,
    s.lga,
    String(s.totalPatients),
    String(s.totalTests),
    String(s.positiveTests),
    String(s.negativeTests),
    String(s.assignedAgents),
    s.agentNames.join('; '),
  ]);
  downloadCsv([headers, ...rows], filename || `community-summary-${new Date().toISOString().split('T')[0]}.csv`);
}

interface PatientRow {
  _id?: string;
  firstName?: string;
  lastName?: string;
  age?: string | number;
  gender?: string;
  contact?: string;
  phoneNumber?: string;
  phone?: string;
  community?: { name?: string; lga?: string } | string;
  testDetails?: Array<{
    testType?: { name?: string } | string;
    testResult?: string;
    dateVisited?: string;
    dateConducted?: string;
    notes?: string;
    officerNote?: string;
    heightCm?: number;
    weightKg?: number;
    bmi?: number;
    bmiCategory?: string;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    bpCategory?: string;
    glucoseLevel?: number;
    glucoseUnit?: string;
    conductedBy?: { name?: string; firstName?: string; lastName?: string } | string;
  }>;
}

/**
 * Export patient data to CSV — one row per test record
 */
export function exportPatientsCsv(patients: PatientRow[], filename?: string) {
  const headers = [
    'Patient Name', 'Age', 'Gender', 'Phone', 'Community', 'LGA',
    'Test Type', 'Test Result', 'Date Conducted', 'Officer Note',
    'Height (cm)', 'Weight (kg)', 'BMI', 'BMI Category',
    'BP Systolic', 'BP Diastolic', 'BP Category',
    'Glucose Level', 'Glucose Unit', 'Conducted By',
  ];

  const rows: string[][] = [];
  patients.forEach((p) => {
    const name = `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Unknown';
    const phone = p.contact || p.phoneNumber || p.phone || '';
    const community = typeof p.community === 'object' ? p.community?.name || '' : String(p.community || '');
    const lga = typeof p.community === 'object' ? p.community?.lga || '' : '';
    const tests = p.testDetails || [];

    if (tests.length === 0) {
      rows.push([name, String(p.age || ''), p.gender || '', phone, community, lga,
        '', '', '', '', '', '', '', '', '', '', '', '', '', '']);
    } else {
      tests.forEach((t) => {
        const testType = typeof t.testType === 'object' ? t.testType?.name || '' : String(t.testType || '');
        const date = t.dateVisited || t.dateConducted || '';
        const note = t.notes || t.officerNote || '';
        let conductedBy = '';
        if (typeof t.conductedBy === 'object' && t.conductedBy) {
          conductedBy = t.conductedBy.name || `${t.conductedBy.firstName || ''} ${t.conductedBy.lastName || ''}`.trim();
        }
        rows.push([
          name, String(p.age || ''), p.gender || '', phone, community, lga,
          testType, t.testResult || '', date, note,
          String(t.heightCm ?? ''), String(t.weightKg ?? ''), String(t.bmi ?? ''), t.bmiCategory || '',
          String(t.bloodPressureSystolic ?? ''), String(t.bloodPressureDiastolic ?? ''), t.bpCategory || '',
          String(t.glucoseLevel ?? ''), t.glucoseUnit || '', conductedBy,
        ]);
      });
    }
  });

  downloadCsv([headers, ...rows], filename || `patients-data-${new Date().toISOString().split('T')[0]}.csv`);
}
