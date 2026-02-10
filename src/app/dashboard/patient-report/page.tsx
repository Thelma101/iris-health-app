'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { calculateBMI, classifyBloodPressure, getBMICategoryColor, getBPCategoryColor } from '@/lib/utils/bmiCalculator';

interface TestDetail {
  _id?: string;
  testType: string | { _id: string; name: string };
  testResult: string;
  dateConducted: string;
  officerNotes?: string;
  testSheetUrl?: string;
  patientImageUrl?: string;
  heightCm?: number;
  weightKg?: number;
  bmi?: number;
  bmiCategory?: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  bpCategory?: string;
  glucoseLevel?: number;
  glucoseUnit?: string;
}

interface PatientData {
  _id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  age?: number;
  gender?: string;
  community?: { _id: string; name: string; lga?: string } | string;
  lga?: string;
  numberOfTests: number;
  testDetails: TestDetail[];
  createdAt: string;
  updatedAt: string;
}

function PatientReportPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = searchParams.get('id');

  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      setError('No patient ID provided');
      setLoading(false);
      return;
    }

    const fetchPatient = async () => {
      try {
        const res = await api.getPatientById(patientId);
        if (res.success) {
          const data = (res.data as any)?.patient || (res.data as any)?.data?.patient;
          setPatient(data);
        } else {
          setError(res.error || 'Failed to fetch patient');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch patient');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  const getTestTypeName = (testType: string | { _id: string; name: string }): string => {
    if (typeof testType === 'object' && testType?.name) return testType.name;
    return String(testType);
  };

  const getCommunityName = (community: PatientData['community']): string => {
    if (typeof community === 'object' && community?.name) return community.name;
    return String(community || '-');
  };

  const getCommunityLga = (community: PatientData['community']): string => {
    if (typeof community === 'object' && community?.lga) return community.lga;
    return '-';
  };

  // Get the latest test detail with health metrics
  const getLatestHealthMetrics = (): TestDetail | null => {
    if (!patient?.testDetails?.length) return null;
    // Find the most recent test with any health metrics
    const sorted = [...patient.testDetails].sort(
      (a, b) => new Date(b.dateConducted).getTime() - new Date(a.dateConducted).getTime()
    );
    return sorted.find(t => t.heightCm || t.weightKg || t.bloodPressureSystolic || t.glucoseLevel) || null;
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <main className="bg-white border border-[#d9d9d9] border-r-0 rounded-bl-[20px] rounded-tl-[20px] w-full min-h-[calc(100vh-93px)] p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2c7be5]" />
      </main>
    );
  }

  if (error || !patient) {
    return (
      <main className="bg-white border border-[#d9d9d9] border-r-0 rounded-bl-[20px] rounded-tl-[20px] w-full min-h-[calc(100vh-93px)] p-6">
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-lg text-[#637381] font-poppins">{error || 'Patient not found'}</p>
          <button
            onClick={() => router.push('/dashboard/view-patients')}
            className="px-6 py-2 bg-[#2c7be5] text-white rounded-lg hover:bg-blue-600 font-poppins cursor-pointer"
          >
            Back to Patients
          </button>
        </div>
      </main>
    );
  }

  const latestMetrics = getLatestHealthMetrics();
  const bmiReport = latestMetrics
    ? (latestMetrics.bmi
        ? { bmi: latestMetrics.bmi, category: latestMetrics.bmiCategory || 'Unknown' }
        : calculateBMI(latestMetrics.weightKg, latestMetrics.heightCm))
    : null;
  const bmiReportDate = latestMetrics?.dateConducted ? new Date(latestMetrics.dateConducted) : null;

  return (
    <main className="bg-white border border-[#d9d9d9] border-r-0 rounded-bl-[20px] rounded-tl-[20px] w-full min-h-[calc(100vh-93px)] p-4 sm:p-6 space-y-4 sm:space-y-6 print:border-0 print:p-0 print:rounded-none">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="h-12 sm:h-[50px] rounded-lg bg-gradient-to-r from-[#fff9e6] to-[#e8f1ff] border-2 border-[#fff9e6] flex items-center px-4 sm:px-5 flex-1">
          <span className="text-base sm:text-xl font-semibold text-[#212b36] uppercase font-poppins">PATIENT HEALTH REPORT</span>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => router.back()}
            className="h-10 px-4 rounded-lg bg-white border border-[#d9d9d9] text-[#637381] font-medium font-poppins hover:bg-gray-50 transition-colors cursor-pointer text-sm"
          >
            Back
          </button>
          <button
            onClick={handlePrint}
            className="h-10 px-4 rounded-lg bg-[#2c7be5] text-white font-medium font-poppins hover:bg-blue-600 transition-colors cursor-pointer text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-2xl font-bold text-[#212b36] font-poppins">PATIENT HEALTH REPORT</h1>
        <p className="text-sm text-[#637381] mt-1">Generated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="space-y-6">
        {/* Patient Information Card */}
        <div className="border border-[#d9d9d9] rounded-lg overflow-hidden">
          <div className="bg-[#e8f1ff] border-b-2 border-[#2c7be5] py-2 px-4">
            <h2 className="text-base font-semibold text-[#212b36] font-poppins">Patient Information</h2>
          </div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-[#b1b9c0] font-poppins uppercase">Full Name</label>
              <p className="text-sm font-medium text-[#212b36] font-poppins mt-0.5">{patient.firstName} {patient.lastName}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-[#b1b9c0] font-poppins uppercase">Age</label>
              <p className="text-sm font-medium text-[#212b36] font-poppins mt-0.5">{patient.age || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-[#b1b9c0] font-poppins uppercase">Gender</label>
              <p className="text-sm font-medium text-[#212b36] font-poppins mt-0.5 capitalize">{patient.gender || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-[#b1b9c0] font-poppins uppercase">Phone</label>
              <p className="text-sm font-medium text-[#212b36] font-poppins mt-0.5">{patient.phone || '-'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-[#b1b9c0] font-poppins uppercase">Community</label>
              <p className="text-sm font-medium text-[#212b36] font-poppins mt-0.5">{getCommunityName(patient.community)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-[#b1b9c0] font-poppins uppercase">LGA</label>
              <p className="text-sm font-medium text-[#212b36] font-poppins mt-0.5">{patient.lga || getCommunityLga(patient.community)}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-[#b1b9c0] font-poppins uppercase">Total Tests</label>
              <p className="text-sm font-medium text-[#212b36] font-poppins mt-0.5">{patient.numberOfTests || patient.testDetails?.length || 0}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-[#b1b9c0] font-poppins uppercase">Registered</label>
              <p className="text-sm font-medium text-[#212b36] font-poppins mt-0.5">
                {new Date(patient.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Health Metrics Summary Card */}
        {latestMetrics && (
          <div className="border border-[#d9d9d9] rounded-lg overflow-hidden">
            <div className="bg-[#e8f1ff] border-b-2 border-[#2c7be5] py-2 px-4">
              <h2 className="text-base font-semibold text-[#212b36] font-poppins">Latest Health Metrics</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* BMI Card */}
                {(latestMetrics.heightCm || latestMetrics.weightKg) && (
                  <div className="border border-[#d9d9d9] rounded-lg p-3 flex flex-col items-center">
                    <span className="text-xs font-medium text-[#b1b9c0] font-poppins uppercase mb-1">BMI</span>
                    {(() => {
                      const bmi = latestMetrics.bmi
                        ? { bmi: latestMetrics.bmi, category: latestMetrics.bmiCategory || 'Unknown' }
                        : calculateBMI(latestMetrics.weightKg, latestMetrics.heightCm);
                      return bmi ? (
                        <>
                          <span className="text-2xl font-bold text-[#212b36] font-poppins">{bmi.bmi}</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border mt-1 ${getBMICategoryColor(bmi.category)}`}>
                            {bmi.category}
                          </span>
                        </>
                      ) : <span className="text-sm text-[#637381]">-</span>;
                    })()}
                  </div>
                )}

                {/* Blood Pressure Card */}
                {(latestMetrics.bloodPressureSystolic || latestMetrics.bloodPressureDiastolic) && (
                  <div className="border border-[#d9d9d9] rounded-lg p-3 flex flex-col items-center">
                    <span className="text-xs font-medium text-[#b1b9c0] font-poppins uppercase mb-1">Blood Pressure</span>
                    <span className="text-2xl font-bold text-[#212b36] font-poppins">
                      {latestMetrics.bloodPressureSystolic || '-'}/{latestMetrics.bloodPressureDiastolic || '-'}
                    </span>
                    <span className="text-xs text-[#637381] font-poppins">mmHg</span>
                    {(() => {
                      const cat = latestMetrics.bpCategory || classifyBloodPressure(
                        latestMetrics.bloodPressureSystolic,
                        latestMetrics.bloodPressureDiastolic
                      );
                      return cat ? (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border mt-1 ${getBPCategoryColor(cat)}`}>
                          {cat}
                        </span>
                      ) : null;
                    })()}
                  </div>
                )}

                {/* Glucose Card */}
                {latestMetrics.glucoseLevel && (
                  <div className="border border-[#d9d9d9] rounded-lg p-3 flex flex-col items-center">
                    <span className="text-xs font-medium text-[#b1b9c0] font-poppins uppercase mb-1">Glucose</span>
                    <span className="text-2xl font-bold text-[#212b36] font-poppins">{latestMetrics.glucoseLevel}</span>
                    <span className="text-xs text-[#637381] font-poppins">{latestMetrics.glucoseUnit || 'mg/dL'}</span>
                  </div>
                )}

                {/* Body Measurements Card */}
                {(latestMetrics.heightCm || latestMetrics.weightKg) && (
                  <div className="border border-[#d9d9d9] rounded-lg p-3 flex flex-col items-center">
                    <span className="text-xs font-medium text-[#b1b9c0] font-poppins uppercase mb-1">Body</span>
                    {latestMetrics.heightCm && (
                      <p className="text-sm text-[#212b36] font-poppins">
                        <span className="font-semibold">{latestMetrics.heightCm}</span> cm
                      </p>
                    )}
                    {latestMetrics.weightKg && (
                      <p className="text-sm text-[#212b36] font-poppins">
                        <span className="font-semibold">{latestMetrics.weightKg}</span> kg
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BMI Report */}
        {bmiReport && (
          <div className="border border-[#d9d9d9] rounded-lg overflow-hidden">
            <div className="bg-[#e8f1ff] border-b-2 border-[#2c7be5] py-2 px-4">
              <h2 className="text-base font-semibold text-[#212b36] font-poppins">BMI Report</h2>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-[#b1b9c0] font-poppins uppercase">BMI Value</label>
                <p className="text-sm font-semibold text-[#212b36] font-poppins mt-0.5">{bmiReport.bmi}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-[#b1b9c0] font-poppins uppercase">Classification</label>
                <span className={`inline-flex mt-1 text-xs font-medium px-2 py-0.5 rounded-full border ${getBMICategoryColor(String(bmiReport.category))}`}>
                  {bmiReport.category}
                </span>
              </div>
              <div>
                <label className="text-xs font-medium text-[#b1b9c0] font-poppins uppercase">Calculated At</label>
                <p className="text-sm text-[#212b36] font-poppins mt-0.5">
                  {bmiReportDate ? bmiReportDate.toLocaleString() : '-'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Test History */}
        <div className="border border-[#d9d9d9] rounded-lg overflow-hidden">
          <div className="bg-[#e8f1ff] border-b-2 border-[#2c7be5] py-2 px-4">
            <h2 className="text-base font-semibold text-[#212b36] font-poppins">Test History</h2>
          </div>
          <div className="divide-y divide-[#d9d9d9]">
            {patient.testDetails && patient.testDetails.length > 0 ? (
              [...patient.testDetails]
                .sort((a, b) => new Date(b.dateConducted).getTime() - new Date(a.dateConducted).getTime())
                .map((test, index) => {
                  const bmi = test.bmi
                    ? { bmi: test.bmi, category: test.bmiCategory || '' }
                    : calculateBMI(test.weightKg, test.heightCm);
                  const bp = test.bpCategory || classifyBloodPressure(
                    test.bloodPressureSystolic,
                    test.bloodPressureDiastolic
                  );

                  return (
                    <div key={test._id || index} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-[#212b36] font-poppins">
                            {getTestTypeName(test.testType)}
                          </span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                            test.testResult?.toLowerCase() === 'positive'
                              ? 'text-red-600 bg-red-50 border-red-200'
                              : test.testResult?.toLowerCase() === 'negative'
                              ? 'text-green-700 bg-green-50 border-green-200'
                              : 'text-gray-600 bg-gray-50 border-gray-200'
                          }`}>
                            {test.testResult}
                          </span>
                        </div>
                        <span className="text-xs text-[#637381] font-poppins">
                          {new Date(test.dateConducted).toLocaleDateString()}
                        </span>
                      </div>

                      {test.officerNotes && (
                        <p className="text-sm text-[#637381] font-poppins mb-2">
                          <span className="font-medium">Note:</span> {test.officerNotes}
                        </p>
                      )}

                      {/* Health metrics for this test */}
                      {(test.heightCm || test.weightKg || test.bloodPressureSystolic || test.glucoseLevel) && (
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {bmi && (
                            <div className="flex items-center gap-1.5 text-xs text-[#637381] font-poppins bg-gray-50 rounded px-2 py-1.5">
                              <span className="font-medium">BMI:</span>
                              <span className="font-semibold text-[#212b36]">{bmi.bmi}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getBMICategoryColor(bmi.category)}`}>
                                {bmi.category}
                              </span>
                            </div>
                          )}
                          {(test.bloodPressureSystolic || test.bloodPressureDiastolic) && (
                            <div className="flex items-center gap-1.5 text-xs text-[#637381] font-poppins bg-gray-50 rounded px-2 py-1.5">
                              <span className="font-medium">BP:</span>
                              <span className="font-semibold text-[#212b36]">
                                {test.bloodPressureSystolic || '-'}/{test.bloodPressureDiastolic || '-'}
                              </span>
                              {bp && (
                                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getBPCategoryColor(String(bp))}`}>
                                  {bp}
                                </span>
                              )}
                            </div>
                          )}
                          {test.glucoseLevel && (
                            <div className="flex items-center gap-1.5 text-xs text-[#637381] font-poppins bg-gray-50 rounded px-2 py-1.5">
                              <span className="font-medium">Glucose:</span>
                              <span className="font-semibold text-[#212b36]">{test.glucoseLevel}</span>
                              <span>{test.glucoseUnit || 'mg/dL'}</span>
                            </div>
                          )}
                          {(test.heightCm || test.weightKg) && (
                            <div className="flex items-center gap-1.5 text-xs text-[#637381] font-poppins bg-gray-50 rounded px-2 py-1.5">
                              {test.heightCm && <span>{test.heightCm}cm</span>}
                              {test.heightCm && test.weightKg && <span>/</span>}
                              {test.weightKg && <span>{test.weightKg}kg</span>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
            ) : (
              <div className="p-8 text-center">
                <p className="text-[#637381] font-poppins">No test records found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PatientReportPage() {
  return (
    <Suspense
      fallback={
        <main className="bg-white border border-[#d9d9d9] border-r-0 rounded-bl-[20px] rounded-tl-[20px] w-full min-h-[calc(100vh-93px)] p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2c7be5]" />
        </main>
      }
    >
      <PatientReportPageContent />
    </Suspense>
  );
}
