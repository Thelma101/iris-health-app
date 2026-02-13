export interface TestDetail {
  _id?: string; // MongoDB ObjectId - required for updates
  testType: string;
  testResult: string;
  dateConducted: string;
  officerNotes?: string;
  testSheetUrl?: string;
  patientImageUrl?: string;
  // Health metrics
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

export interface Patient {
  id: number | string;
  _id?: string; // MongoDB ObjectId
  name: string;
  age: string;
  gender: string;
  community: string;
  lga: string;
  testsTaken: number;
  lastTestType: string;
  phoneNumber?: string;
  phone?: string;
  testDetails?: TestDetail[];
  testSheetUrl?: string;
  patientImageUrl?: string;
}
