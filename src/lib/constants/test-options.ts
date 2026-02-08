// REMOVED: TEST_TYPE_OPTIONS - Test types must come from API (/admin/testtypes)
// REMOVED: TEST_RESULT_OPTIONS - Test results must come from API (allowedResults per test type)
// REMOVED: DEFAULT_TEST_TYPES - Test types must come from API (/admin/testtypes)

// Type definition for test type from API
export interface TestType {
  _id: string;
  id?: number;
  name: string;
  allowedResults: string[];
  results?: string[];
  description?: string;
  isActive?: boolean;
}

