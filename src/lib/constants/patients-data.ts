export interface Patient {
  id: number;
  name: string;
  age: string;
  gender: string;
  community: string;
  lga: string;
  testsTaken: number;
  lastTestResult: string;
}

export const PATIENTS_DATA: Patient[] = [
  { id: 1, name: 'Brooklyn Simmons', age: '27yrs', gender: 'Male', community: 'Igbogbo', lga: 'Ikorodu', testsTaken: 3, lastTestResult: 'Negative' },
  { id: 2, name: 'Darrell Steward', age: '27yrs', gender: 'Male', community: 'Igbogbo', lga: 'Alimosho', testsTaken: 3, lastTestResult: 'Negative' },
];
