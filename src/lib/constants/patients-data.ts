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
  { id: 3, name: 'Ronald Richards', age: '27yrs', gender: 'Female', community: 'Igbogbo', lga: 'Ojo', testsTaken: 3, lastTestResult: 'Negative' },
  { id: 4, name: 'Kathryn Murphy', age: '27yrs', gender: 'Male', community: 'Igbogbo', lga: 'Surulere', testsTaken: 3, lastTestResult: 'Negative' },
  { id: 5, name: 'Jenny Wilson', age: '27yrs', gender: 'Female', community: 'Igbogbo', lga: 'Ikorodu', testsTaken: 3, lastTestResult: 'Negative' },
  { id: 6, name: 'Devon Lane', age: '27yrs', gender: 'Female', community: 'Igbogbo', lga: 'Ikorodu', testsTaken: 3, lastTestResult: 'Negative' },
  { id: 7, name: 'Jacob Jones', age: '27yrs', gender: 'Male', community: 'Igbogbo', lga: 'Ikorodu', testsTaken: 3, lastTestResult: 'Negative' },
  { id: 8, name: 'Leslie Alexander', age: '27yrs', gender: 'Male', community: 'Igbogbo', lga: 'Surulere', testsTaken: 3, lastTestResult: 'Negative' },
  { id: 9, name: 'Wade Warren', age: '27yrs', gender: 'Male', community: 'Igbogbo', lga: 'Ikorodu', testsTaken: 3, lastTestResult: 'Negative' },
  { id: 10, name: 'Cameron Williamson', age: '27yrs', gender: 'Male', community: 'Igbogbo', lga: 'Surulere', testsTaken: 3, lastTestResult: 'Negative' },
  { id: 11, name: 'Bessie Cooper', age: '27yrs', gender: 'Male', community: 'Igbogbo', lga: 'Ikorodu', testsTaken: 3, lastTestResult: 'Negative' },
  { id: 12, name: 'Eleanor Pena', age: '27yrs', gender: 'Male', community: 'Igbogbo', lga: 'Ikorodu', testsTaken: 3, lastTestResult: 'Negative' },
  { id: 13, name: 'Savannah Nguyen', age: '27yrs', gender: 'Male', community: 'Igbogbo', lga: 'Surulere', testsTaken: 3, lastTestResult: 'Negative' },
  { id: 14, name: 'Courtney Henry', age: '27yrs', gender: 'Male', community: 'Igbogbo', lga: 'Ikorodu', testsTaken: 3, lastTestResult: 'Negative' },
  { id: 15, name: 'Floyd Miles', age: '27yrs', gender: 'Male', community: 'Igbogbo', lga: 'Ikorodu', testsTaken: 3, lastTestResult: 'Negative' },
  { id: 16, name: 'Guy Hawkins', age: '27yrs', gender: 'Male', community: 'Igbogbo', lga: 'Ikorodu', testsTaken: 3, lastTestResult: 'Negative' },
];
