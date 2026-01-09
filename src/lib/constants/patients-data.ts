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
  { id: 1, name: 'Tee George', age: '34yrs', gender: 'Male', community: 'Green Lunar District', lga: 'Ikorodu', testsTaken: 5, lastTestResult: 'Complete' },
  { id: 2, name: 'Green Lunar', age: '29yrs', gender: 'Female', community: 'Tee George Community', lga: 'Alimosho', testsTaken: 4, lastTestResult: 'Normal' },
  { id: 3, name: 'Brooklyn Simmons', age: '27yrs', gender: 'Male', community: 'Igbogbo', lga: 'Ikorodu', testsTaken: 3, lastTestResult: 'Negative' },
  { id: 4, name: 'Darrell Steward', age: '27yrs', gender: 'Male', community: 'Igbogbo', lga: 'Alimosho', testsTaken: 3, lastTestResult: 'Negative' },
];
