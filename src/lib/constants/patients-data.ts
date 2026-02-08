export interface TestDetail {
  _id?: string; // MongoDB ObjectId - required for updates
  testType: string;
  testResult: string;
  dateConducted: string;
  officerNotes?: string;
  testSheetUrl?: string;
  patientImageUrl?: string;
}

export interface Patient {
  id: number | string;
  _id?: string; // MongoDB ObjectId
  name: string;
  age: string;
  gender: string;
  community: string;
  lga: string;
  testsTaken: number;
  lastTestResult: string;
  phoneNumber?: string;
  phone?: string;
  testDetails?: TestDetail[];
  testSheetUrl?: string;
  patientImageUrl?: string;
}

// REMOVED: Dummy PATIENTS_DATA - All patient data must come from API (/patients)
