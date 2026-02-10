import jsPDF from 'jspdf';

// Format ISO date string to human-readable format
export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateStr;
  }
}

interface PatientPDFData {
  name: string;
  patientId?: string;
  age?: string | number;
  gender?: string;
  phone?: string;
  community?: string;
  lga?: string;
  registeredDate?: string;
  totalTests?: number;
  testDetails?: Array<{
    testType?: string;
    testResult?: string;
    dateConducted?: string;
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
    conductedBy?: string;
  }>;
}

export function generatePatientReportPDF(patient: PatientPDFData): jsPDF {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (needed: number) => {
    if (y + needed > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = margin;
    }
  };

  // --- HEADER ---
  doc.setFillColor(44, 123, 229); // #2c7be5
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('CONSOLIDATED PATIENT HEALTH REPORT', pageWidth / 2, 12, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('MedTrack Health Information System', pageWidth / 2, 18, { align: 'center' });

  // Report meta
  const reportId = patient.patientId ? `RPT-${patient.patientId.slice(-8).toUpperCase()}` : 'RPT-' + Date.now().toString(36).toUpperCase();
  doc.setFontSize(7);
  doc.text(`Report ID: ${reportId}`, margin, 25);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, 25, { align: 'right' });

  y = 35;

  // --- PATIENT INFORMATION ---
  doc.setFillColor(232, 241, 255); // #e8f1ff
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setDrawColor(44, 123, 229);
  doc.line(margin, y + 8, margin + contentWidth, y + 8);
  doc.setTextColor(33, 43, 54);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Patient Information', margin + 3, y + 5.5);
  y += 12;

  doc.setFontSize(9);
  const infoFields = [
    ['Full Name', patient.name || '-'],
    ['Patient ID', patient.patientId ? patient.patientId.slice(-8).toUpperCase() : '-'],
    ['Age', String(patient.age || '-')],
    ['Gender', patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : '-'],
    ['Phone', patient.phone || '-'],
    ['Community', patient.community || '-'],
    ['LGA', patient.lga || '-'],
    ['Total Tests', String(patient.totalTests ?? patient.testDetails?.length ?? 0)],
    ['Registered', formatDate(patient.registeredDate)],
  ];

  const colWidth = contentWidth / 3;
  infoFields.forEach((field, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const fx = margin + col * colWidth + 3;
    const fy = y + row * 10;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(177, 185, 192); // #b1b9c0
    doc.setFontSize(7);
    doc.text(field[0].toUpperCase(), fx, fy);
    doc.setTextColor(33, 43, 54);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(field[1], fx, fy + 4);
  });

  y += Math.ceil(infoFields.length / 3) * 10 + 4;

  // --- REGISTRATION SUMMARY ---
  checkPageBreak(30);
  doc.setFillColor(232, 241, 255);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setDrawColor(44, 123, 229);
  doc.line(margin, y + 8, margin + contentWidth, y + 8);
  doc.setTextColor(33, 43, 54);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Registration Summary', margin + 3, y + 5.5);
  y += 12;

  const tests = patient.testDetails || [];
  const positiveCount = tests.filter(t => (t.testResult || '').toLowerCase() === 'positive').length;
  const negativeCount = tests.filter(t => (t.testResult || '').toLowerCase() === 'negative').length;

  const summaryItems = [
    ['Total Tests', String(tests.length)],
    ['Positive', String(positiveCount)],
    ['Negative', String(negativeCount)],
    ['First Visit', formatDate(patient.registeredDate)],
  ];

  const sColWidth = contentWidth / 4;
  summaryItems.forEach((item, i) => {
    const sx = margin + i * sColWidth;
    doc.setDrawColor(217, 217, 217);
    doc.roundedRect(sx + 2, y, sColWidth - 4, 16, 2, 2, 'S');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(177, 185, 192);
    doc.text(item[0].toUpperCase(), sx + sColWidth / 2, y + 5, { align: 'center' });
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    const color = item[0] === 'Positive' ? [220, 38, 38] : item[0] === 'Negative' ? [22, 163, 74] : [33, 43, 54];
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(item[1], sx + sColWidth / 2, y + 12.5, { align: 'center' });
  });

  y += 22;

  // --- HEALTH METRICS (from latest test) ---
  const sortedTests = [...tests].sort((a, b) => new Date(b.dateConducted || '').getTime() - new Date(a.dateConducted || '').getTime());
  const latestWithMetrics = sortedTests.find(t => t.heightCm || t.weightKg || t.bloodPressureSystolic || t.glucoseLevel);

  if (latestWithMetrics) {
    checkPageBreak(35);
    doc.setFillColor(232, 241, 255);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setDrawColor(44, 123, 229);
    doc.line(margin, y + 8, margin + contentWidth, y + 8);
    doc.setTextColor(33, 43, 54);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Latest Health Metrics', margin + 3, y + 5.5);
    y += 12;

    const metrics: string[][] = [];
    if (latestWithMetrics.bmi) {
      metrics.push(['BMI', `${latestWithMetrics.bmi} (${latestWithMetrics.bmiCategory || 'N/A'})`]);
    } else if (latestWithMetrics.heightCm && latestWithMetrics.weightKg) {
      const bmi = latestWithMetrics.weightKg / ((latestWithMetrics.heightCm / 100) ** 2);
      let cat = 'Normal';
      if (bmi < 18.5) cat = 'Underweight';
      else if (bmi < 25) cat = 'Normal';
      else if (bmi < 30) cat = 'Overweight';
      else cat = 'Obese';
      metrics.push(['BMI', `${bmi.toFixed(1)} (${cat})`]);
    }
    if (latestWithMetrics.bloodPressureSystolic) {
      metrics.push(['Blood Pressure', `${latestWithMetrics.bloodPressureSystolic}/${latestWithMetrics.bloodPressureDiastolic || '-'} mmHg (${latestWithMetrics.bpCategory || 'N/A'})`]);
    }
    if (latestWithMetrics.glucoseLevel) {
      metrics.push(['Glucose', `${latestWithMetrics.glucoseLevel} ${latestWithMetrics.glucoseUnit || 'mg/dL'}`]);
    }
    if (latestWithMetrics.heightCm) metrics.push(['Height', `${latestWithMetrics.heightCm} cm`]);
    if (latestWithMetrics.weightKg) metrics.push(['Weight', `${latestWithMetrics.weightKg} kg`]);

    metrics.forEach((m, i) => {
      const mx = margin + 3;
      const my = y + i * 7;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(177, 185, 192);
      doc.text(m[0].toUpperCase(), mx, my);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(33, 43, 54);
      doc.text(m[1], mx + 40, my);
    });

    y += metrics.length * 7 + 4;
  }

  // --- TEST RESULTS ---
  checkPageBreak(20);
  doc.setFillColor(232, 241, 255);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setDrawColor(44, 123, 229);
  doc.line(margin, y + 8, margin + contentWidth, y + 8);
  doc.setTextColor(33, 43, 54);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Test Results', margin + 3, y + 5.5);
  y += 12;

  if (sortedTests.length === 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(99, 115, 129);
    doc.text('No test records found', margin + 3, y);
    y += 8;
  } else {
    sortedTests.forEach((test, idx) => {
      checkPageBreak(35);
      
      // Test header
      doc.setFillColor(244, 245, 247);
      doc.rect(margin, y, contentWidth, 7, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(33, 43, 54);
      const testName = test.testType || 'Unknown Test';
      doc.text(`#${idx + 1}  ${testName}`, margin + 3, y + 5);
      
      // Result badge
      const result = (test.testResult || 'N/A').toLowerCase();
      const isPositive = result === 'positive';
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      if (isPositive) {
        doc.setTextColor(220, 38, 38);
      } else {
        doc.setTextColor(22, 163, 74);
      }
      doc.text(test.testResult || 'N/A', pageWidth - margin - 3, y + 5, { align: 'right' });
      y += 10;

      // Test details
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(99, 115, 129);
      doc.text(`Date: ${formatDate(test.dateConducted)}`, margin + 5, y);
      y += 5;

      if (test.conductedBy) {
        doc.text(`Conducted by: ${test.conductedBy}`, margin + 5, y);
        y += 5;
      }

      if (test.officerNote) {
        const noteLines = doc.splitTextToSize(`Note: ${test.officerNote}`, contentWidth - 10);
        doc.text(noteLines, margin + 5, y);
        y += noteLines.length * 4 + 1;
      }

      // Health metrics for this test
      if (test.bmi || test.bloodPressureSystolic || test.glucoseLevel || test.heightCm) {
        const testMetrics: string[] = [];
        if (test.bmi) testMetrics.push(`BMI: ${test.bmi} (${test.bmiCategory || '-'})`);
        if (test.bloodPressureSystolic) testMetrics.push(`BP: ${test.bloodPressureSystolic}/${test.bloodPressureDiastolic || '-'} mmHg (${test.bpCategory || '-'})`);
        if (test.glucoseLevel) testMetrics.push(`Glucose: ${test.glucoseLevel} ${test.glucoseUnit || 'mg/dL'}`);
        if (test.heightCm) testMetrics.push(`Height: ${test.heightCm} cm`);
        if (test.weightKg) testMetrics.push(`Weight: ${test.weightKg} kg`);
        
        doc.setFontSize(7);
        doc.setTextColor(99, 115, 129);
        doc.text(testMetrics.join('  |  '), margin + 5, y);
        y += 5;
      }

      // Separator
      doc.setDrawColor(217, 217, 217);
      doc.line(margin + 3, y, margin + contentWidth - 3, y);
      y += 4;
    });
  }

  // --- RECOMMENDATIONS ---
  checkPageBreak(30);
  doc.setFillColor(255, 249, 230); // #fff9e6
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setDrawColor(245, 158, 11); // #f59e0b
  doc.line(margin, y + 8, margin + contentWidth, y + 8);
  doc.setTextColor(33, 43, 54);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary & Recommendations', margin + 3, y + 5.5);
  y += 12;

  const recommendations = generateRecommendations(sortedTests);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(99, 115, 129);
  recommendations.forEach(rec => {
    checkPageBreak(8);
    const lines = doc.splitTextToSize(`• ${rec}`, contentWidth - 10);
    doc.text(lines, margin + 5, y);
    y += lines.length * 4 + 2;
  });

  y += 4;

  // --- AUTHORIZATION / SIGNATURE ---
  checkPageBreak(40);
  doc.setFillColor(232, 241, 255);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setDrawColor(44, 123, 229);
  doc.line(margin, y + 8, margin + contentWidth, y + 8);
  doc.setTextColor(33, 43, 54);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Authorization', margin + 3, y + 5.5);
  y += 14;

  // Left column: signature
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(177, 185, 192);
  doc.text('REVIEWED BY (DOCTOR / OFFICER)', margin + 3, y);
  y += 4;
  doc.setDrawColor(217, 217, 217);
  doc.line(margin + 3, y + 12, margin + contentWidth / 2 - 5, y + 12);
  doc.setFontSize(7);
  doc.setTextColor(200, 200, 200);
  doc.text('Signature', margin + 3, y + 2);
  
  // Right column: date & report info
  const rx = margin + contentWidth / 2 + 5;
  doc.setTextColor(177, 185, 192);
  doc.setFontSize(7);
  doc.text('DATE & TIME', rx, y - 4);
  doc.setTextColor(33, 43, 54);
  doc.setFontSize(9);
  doc.text(new Date().toLocaleString(), rx, y);
  
  doc.setTextColor(177, 185, 192);
  doc.setFontSize(7);
  doc.text('REPORT VERSION', rx, y + 6);
  doc.setTextColor(33, 43, 54);
  doc.setFontSize(9);
  doc.text('v1', rx, y + 10);

  doc.setTextColor(177, 185, 192);
  doc.setFontSize(7);
  doc.text('REPORT ID', rx, y + 16);
  doc.setTextColor(33, 43, 54);
  doc.setFontSize(9);
  doc.text(reportId, rx, y + 20);

  y += 28;

  // --- FOOTER ---
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(
      'This report is generated by MedTrack Health Information System and is confidential.',
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 6,
      { align: 'center' }
    );
  }

  return doc;
}

function generateRecommendations(tests: PatientPDFData['testDetails']): string[] {
  if (!tests || tests.length === 0) return ['No test data available for recommendations.'];
  
  const recommendations: string[] = [];
  const latest = tests[0]; // already sorted newest first

  // BMI
  if (latest?.bmi) {
    if (latest.bmiCategory === 'Underweight') recommendations.push('Patient is underweight. Consider nutritional counseling and dietary supplementation.');
    else if (latest.bmiCategory === 'Overweight') recommendations.push('Patient is overweight. Recommend lifestyle modifications including diet and exercise.');
    else if (latest.bmiCategory === 'Obese') recommendations.push('Patient is obese. Strongly recommend weight management program and further metabolic screening.');
  }

  // BP
  if (latest?.bpCategory) {
    if (latest.bpCategory.includes('Elevated')) recommendations.push('Blood pressure is elevated. Monitor regularly and consider lifestyle changes.');
    else if (latest.bpCategory.includes('Stage 1')) recommendations.push('Stage 1 hypertension detected. Medical evaluation and potential medication required.');
    else if (latest.bpCategory.includes('Stage 2')) recommendations.push('Stage 2 hypertension detected. Urgent medical intervention recommended.');
    else if (latest.bpCategory.includes('Crisis')) recommendations.push('Hypertensive crisis detected. Immediate medical attention required.');
  }

  // Positive tests
  const positiveTests = tests.filter(t => (t?.testResult || '').toLowerCase() === 'positive');
  if (positiveTests.length > 0) {
    const names = positiveTests.map(t => t?.testType || 'Unknown').join(', ');
    recommendations.push(`Positive test result(s) for: ${names}. Follow-up testing and treatment recommended.`);
  }

  if (recommendations.length === 0) {
    recommendations.push('No immediate health concerns identified. Continue routine health monitoring.');
  }

  return recommendations;
}

// Generate a community bulk report PDF with all patients
export function generateCommunityReportPDF(
  communityName: string,
  patients: Array<{
    firstName?: string;
    lastName?: string;
    age?: string | number;
    gender?: string;
    phone?: string;
    community?: any;
    lga?: string;
    testDetails?: any[];
    createdAt?: string;
  }>,
  communityStats?: {
    totalPatients: number;
    totalTests: number;
    positiveTests: number;
    negativeTests: number;
    assignedAgents: number;
    agentNames: string[];
  }
): jsPDF {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (needed: number) => {
    if (y + needed > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = margin;
    }
  };

  // Header
  doc.setFillColor(44, 123, 229);
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('COMMUNITY HEALTH REPORT', pageWidth / 2, 11, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${communityName}  |  Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 18, { align: 'center' });

  y = 32;

  // Community Summary
  if (communityStats) {
    doc.setFillColor(232, 241, 255);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setDrawColor(44, 123, 229);
    doc.line(margin, y + 8, margin + contentWidth, y + 8);
    doc.setTextColor(33, 43, 54);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Community Summary', margin + 3, y + 5.5);
    y += 12;

    const stats = [
      ['Total Patients', String(communityStats.totalPatients)],
      ['Total Tests', String(communityStats.totalTests)],
      ['Positive Results', String(communityStats.positiveTests)],
      ['Negative Results', String(communityStats.negativeTests)],
      ['Assigned Agents', String(communityStats.assignedAgents)],
    ];
    if (communityStats.agentNames.length > 0) {
      stats.push(['Agent Names', communityStats.agentNames.join(', ')]);
    }

    stats.forEach(s => {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(99, 115, 129);
      doc.text(s[0] + ':', margin + 5, y);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(33, 43, 54);
      doc.text(s[1], margin + 50, y);
      y += 5;
    });
    y += 4;
  }

  // Patient listing
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(33, 43, 54);
  doc.text(`Total Patients: ${patients.length}`, margin + 3, y);
  y += 8;

  patients.forEach((p, idx) => {
    checkPageBreak(40);

    const commObj = p.community;
    const commName = typeof commObj === 'object' ? commObj?.name : commObj;
    const commLga = p.lga || (typeof commObj === 'object' ? commObj?.lga : '-');

    // Patient header
    doc.setFillColor(244, 245, 247);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(33, 43, 54);
    doc.text(`Patient ${idx + 1}: ${p.firstName || ''} ${p.lastName || ''}`, margin + 3, y + 5);
    y += 10;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(99, 115, 129);
    doc.text(`Age: ${p.age || '-'}  |  Gender: ${p.gender || '-'}  |  Phone: ${p.phone || '-'}`, margin + 5, y);
    y += 4;
    doc.text(`Community: ${commName || '-'}  |  LGA: ${commLga || '-'}  |  Tests: ${p.testDetails?.length || 0}`, margin + 5, y);
    y += 6;

    if (p.testDetails?.length) {
      const sorted = [...p.testDetails].sort((a: any, b: any) =>
        new Date(b.dateConducted || '').getTime() - new Date(a.dateConducted || '').getTime()
      );
      sorted.forEach((t: any, ti: number) => {
        checkPageBreak(15);
        const testName = typeof t.testType === 'object' ? t.testType?.name : t.testType;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(33, 43, 54);
        doc.text(`  Test ${ti + 1}: ${testName || 'N/A'} — ${t.testResult || 'N/A'} (${formatDate(t.dateConducted)})`, margin + 5, y);
        y += 4;

        const extras: string[] = [];
        if (t.bmi) extras.push(`BMI: ${t.bmi} (${t.bmiCategory || '-'})`);
        if (t.bloodPressureSystolic) extras.push(`BP: ${t.bloodPressureSystolic}/${t.bloodPressureDiastolic || '-'} mmHg`);
        if (t.glucoseLevel) extras.push(`Glucose: ${t.glucoseLevel} ${t.glucoseUnit || 'mg/dL'}`);
        if (extras.length > 0) {
          doc.setFontSize(7);
          doc.setTextColor(130, 130, 130);
          doc.text(`    ${extras.join('  |  ')}`, margin + 5, y);
          y += 4;
        }
        if (t.officerNotes) {
          doc.setFontSize(7);
          doc.setTextColor(130, 130, 130);
          const noteLines = doc.splitTextToSize(`    Notes: ${t.officerNotes}`, contentWidth - 15);
          doc.text(noteLines, margin + 5, y);
          y += noteLines.length * 3.5;
        }
      });
    }

    // Separator
    doc.setDrawColor(217, 217, 217);
    doc.line(margin + 3, y, margin + contentWidth - 3, y);
    y += 5;
  });

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(
      'This report is generated by MedTrack Health Information System and is confidential.',
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 6,
      { align: 'center' }
    );
  }

  return doc;
}
