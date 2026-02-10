import { classifyResult } from '@/lib/utils/resultClassifier';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Server returned non-JSON response: ${response.status}`);
    }

    if (!response.ok) {
      throw new Error(data.message || `API Error: ${response.status}`);
    }

    return { success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

// Dashboard stats types
export interface DashboardStats {
  communities: number;
  fieldAgents: number;
  tests: number;
  communitiesCovered: number;
  fieldAgentsAvailable: number;
  lastTestDate: string;
}

export interface RecentRecord {
  community: string;
  totalTests: number;
  topPositiveTest: string;
  topNegativeTest: string;
}

export interface Community {
  _id: string;
  name: string;
  lga: string;
  dateVisited?: string;
  visitationSummary?: string;
  fieldOfficers?: Array<{ _id: string; firstName: string; lastName: string; email: string }>;
  totalPopulation?: number;
  totalTestsConducted?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FieldAgent {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: 'Field Officer' | 'Admin';
  createdAt?: string;
  updatedAt?: string;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    apiRequest('/admin/login', { method: 'POST', body: JSON.stringify(credentials) }),

  register: (data: object) =>
    apiRequest('/admin/signup', { method: 'POST', body: JSON.stringify(data) }),

  forgotPassword: (email: string) =>
    apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  // Admin Management
  getAllAdmins: () => apiRequest('/admin/admins'),

  updateAdminProfile: (data: { name: string }) =>
    apiRequest('/admin/update', { method: 'PATCH', body: JSON.stringify(data) }),

  // Users (both Admins and Field Agents)
  getUsers: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      return { success: false, error: 'Authentication required. Please login.', data: { fieldAgents: [] } };
    }

    try {
      const [fieldAgentsRes, adminsRes] = await Promise.all([
        apiRequest<{ agents: FieldAgent[] }>('/fieldAgent/'),
        apiRequest<{ admins: any[] }>('/admin/admins')
      ]);

      if (!fieldAgentsRes.success) {
        if (fieldAgentsRes.error?.includes('401') || fieldAgentsRes.error?.includes('authorized') || fieldAgentsRes.error?.includes('token')) {
          return { success: false, error: 'Session expired. Please login again.', data: { fieldAgents: [] } };
        }
      }

      const fieldAgentsData = fieldAgentsRes.data as any;
      const fieldAgents = fieldAgentsRes.success
        ? (fieldAgentsData?.agents || fieldAgentsData?.data?.agents || fieldAgentsData?.fieldAgents || [])
        : [];

      const mappedFieldAgents = fieldAgents.map((f: any) => ({ ...f, role: 'Field Officer' }));
      const allUsers = [...mappedFieldAgents];
      
      // Add ALL admins from the admins endpoint
      if (adminsRes.success && adminsRes.data) {
        const adminsData = (adminsRes.data as any)?.admins || [];
        adminsData.forEach((admin: any) => {
          const nameParts = (admin.name || '').split(' ');
          const adminUser = {
            _id: admin._id,
            firstName: nameParts[0] || admin.name || 'Admin',
            lastName: nameParts.slice(1).join(' ') || '',
            email: admin.email,
            role: 'Admin',
            status: 'Active',
            createdAt: admin.createdAt,
          };
          allUsers.unshift(adminUser);
        });
      }

      return { success: true, data: { fieldAgents: allUsers } };
    } catch (error) {
      return { success: false, error: 'Failed to fetch users', data: { fieldAgents: [] } };
    }
  },
  getUser: (id: string) => apiRequest(`/fieldAgent/${id}`),
  createUser: (data: { firstName: string; lastName: string; email: string; password: string; role?: string }) => {
    // Route to appropriate endpoint based on role
    if (data.role === 'Admin') {
      // Admin endpoint expects 'name' instead of firstName/lastName
      const adminData = {
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        password: data.password,
      };
      return apiRequest('/admin/signup', { method: 'POST', body: JSON.stringify(adminData) });
    }
    // Field Agent endpoint expects firstName and lastName
    return apiRequest('/fieldAgent/signup', { method: 'POST', body: JSON.stringify(data) });
  },
  updateUser: (id: string, data: { firstName?: string; lastName?: string; email?: string; status?: string; password?: string; role?: string }) => {
    // Route to appropriate endpoint based on role
    if (data.role === 'Admin') {
      // Admin - convert firstName/lastName to name if present
      const adminData: Record<string, any> = { ...data };
      if (adminData.firstName || adminData.lastName) {
        adminData.name = `${adminData.firstName || ''} ${adminData.lastName || ''}`.trim();
        delete adminData.firstName;
        delete adminData.lastName;
      }
      delete adminData.role; // Don't send role to backend
      return apiRequest(`/admin/${id}`, { method: 'PATCH', body: JSON.stringify(adminData) });
    }
    // Field Agent
    const agentData: Record<string, any> = { ...data };
    delete agentData.role; // Don't send role to backend
    return apiRequest(`/fieldAgent/${id}`, { method: 'PUT', body: JSON.stringify(agentData) });
  },
  deleteUser: (id: string, role?: string) => {
    if (role === 'Admin') {
      return apiRequest(`/admin/${id}`, { method: 'DELETE' });
    }
    return apiRequest(`/fieldAgent/${id}`, { method: 'DELETE' });
  },

  // Field Agents/Officers - use backend summary endpoint for accurate test counts
  getFieldAgents: () => apiRequest('/fieldAgent/'),
  getFieldOfficers: async (): Promise<ApiResponse<Array<{ id: string; name: string; testCount: number }>>> => {
    try {
      // Use the dedicated backend endpoint that computes counts from community assignments
      const summaryRes = await apiRequest<{ data: any[] }>('/fieldAgent/getFieldOfficersStats');
      const summaryData = summaryRes.data as any;
      const officers = summaryData?.data || summaryData?.officers || [];

      if (Array.isArray(officers) && officers.length > 0) {
        return {
          success: true,
          data: officers.map((officer: any) => ({
            id: officer.id || officer._id,
            name: officer.name || 'Unknown',
            testCount: officer.numberOfTests || 0,
          })),
        };
      }

      // Fallback: fetch agents list and compute from patients
      const [agentsResponse, patientsResponse] = await Promise.all([
        apiRequest<{ agents: any[] }>('/fieldAgent/'),
        apiRequest<{ patients: any[] }>('/patients'),
      ]);

      if (!agentsResponse.success) {
        return { success: false, error: agentsResponse.error, data: [] };
      }

      const agentsData = agentsResponse.data as any;
      const agents = agentsData?.agents || agentsData?.data?.agents || agentsData?.fieldAgents || [];

      const patientsData = patientsResponse.data as any;
      const patients = patientsData?.data?.patients || patientsData?.patients || [];

      // Count tests by conductedBy field
      const testCountByOfficer: Record<string, number> = {};
      patients.forEach((patient: any) => {
        const tests = patient.testDetails || [];
        tests.forEach((test: any) => {
          const conductedBy = test.conductedBy?._id || test.conductedBy;
          if (conductedBy) {
            testCountByOfficer[conductedBy] = (testCountByOfficer[conductedBy] || 0) + 1;
          }
        });
      });

      if (Array.isArray(agents) && agents.length > 0) {
        return {
          success: true,
          data: agents.map((agent: any) => {
            const agentId = agent._id || agent.id;
            return {
              id: agentId,
              name: `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || 'Unknown',
              testCount: testCountByOfficer[agentId] || 0,
            };
          }),
        };
      }
      return { success: true, data: [] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch field officers',
        data: [],
      };
    }
  },

  // Get patients filtered by the officer - uses conductedBy first, then community assignment fallback
  getPatientsByOfficer: async (officerId: string): Promise<ApiResponse<Array<{
    index: number;
    name: string;
    patientId: string;
    firstName: string;
    lastName: string;
    age: string;
    gender: string;
    phoneNumber: string;
    community: string;
    lga: string;
    testDetails: Array<{
      testType: string;
      testResult: string;
      dateConducted: string;
      officerNote: string;
      heightCm?: number;
      weightKg?: number;
      bmi?: number;
      bmiCategory?: string;
      bloodPressureSystolic?: number;
      bloodPressureDiastolic?: number;
      bpCategory?: string;
      glucoseLevel?: number;
      glucoseUnit?: string;
    }>;
  }>>> => {
    try {
      const [patientsRes, communitiesRes] = await Promise.all([
        apiRequest<{ patients: any[] }>('/patients'),
        apiRequest<{ communities: any[] }>('/community/all'),
      ]);
      const patientsData = patientsRes.data as any;
      const patients = patientsData?.data?.patients || patientsData?.patients || [];

      const mapPatient = (patient: any, tests: any[], startIndex: number) => ({
        index: startIndex,
        name: `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown',
        patientId: patient._id,
        firstName: patient.firstName || '',
        lastName: patient.lastName || '',
        age: patient.age?.toString() || '',
        gender: patient.gender || '',
        phoneNumber: patient.contact || patient.phoneNumber || patient.phone || '',
        community: patient.community?.name || patient.community || '',
        lga: patient.community?.lga || patient.lga || '',
        testDetails: tests.map((test: any) => ({
          testType: test.testType?.name || test.testType || '',
          testResult: test.testResult || '',
          dateConducted: test.dateVisited || test.dateConducted || '',
          officerNote: test.notes || test.officerNote || test.officerNotes || '',
          heightCm: test.heightCm,
          weightKg: test.weightKg,
          bmi: test.bmi,
          bmiCategory: test.bmiCategory,
          bloodPressureSystolic: test.bloodPressureSystolic,
          bloodPressureDiastolic: test.bloodPressureDiastolic,
          bpCategory: test.bpCategory,
          glucoseLevel: test.glucoseLevel,
          glucoseUnit: test.glucoseUnit,
        })),
      });

      // Strategy 1: Filter by conductedBy field
      const filteredByConductedBy: Array<any> = [];
      let index = 1;
      patients.forEach((patient: any) => {
        const tests = patient.testDetails || [];
        const testsByOfficer = tests.filter((test: any) => {
          const conductedBy = test.conductedBy?._id || test.conductedBy;
          return conductedBy === officerId;
        });
        if (testsByOfficer.length > 0) {
          filteredByConductedBy.push(mapPatient(patient, testsByOfficer, index++));
        }
      });

      if (filteredByConductedBy.length > 0) {
        return { success: true, data: filteredByConductedBy };
      }

      // Strategy 2: Fall back to community assignment
      const commData = communitiesRes.data as any;
      const communities = commData?.data?.communities || commData?.communities || [];
      const officerCommunityIds = new Set<string>();
      communities.forEach((c: any) => {
        const officers = c.fieldOfficers || [];
        officers.forEach((o: any) => {
          const oid = o._id || o;
          if (oid === officerId || oid?.toString() === officerId) {
            officerCommunityIds.add(c._id);
          }
        });
      });

      const filteredByCommunity: Array<any> = [];
      index = 1;
      patients.forEach((patient: any) => {
        const commId = patient.community?._id || patient.community;
        if (commId && officerCommunityIds.has(commId)) {
          const tests = patient.testDetails || [];
          if (tests.length > 0) {
            filteredByCommunity.push(mapPatient(patient, tests, index++));
          }
        }
      });

      return { success: true, data: filteredByCommunity };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch patients',
        data: [],
      };
    }
  },

  getFieldAgent: (id: string) => apiRequest(`/fieldAgent/${id}`),
  createFieldAgent: (data: object) =>
    apiRequest('/fieldAgent/signup', { method: 'POST', body: JSON.stringify(data) }),
  updateFieldAgent: (id: string, data: object) =>
    apiRequest(`/fieldAgent/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFieldAgent: (id: string) =>
    apiRequest(`/fieldAgent/${id}`, { method: 'DELETE' }),

  // Patients
  getPatients: (params?: { community?: string; page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.community) searchParams.set('community', params.community);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    const qs = searchParams.toString();
    return apiRequest(`/patients${qs ? `?${qs}` : ''}`);
  },
  getPatientsByCommunity: (communityId: string, params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const qs = searchParams.toString();
    return apiRequest(`/community/${communityId}/patients${qs ? `?${qs}` : ''}`);
  },
  getPatient: (id: string) => apiRequest(`/patients/${id}`),
  getPatientById: (id: string) => apiRequest(`/patients/${id}`),
  createPatient: (data: object) =>
    apiRequest('/patients', { method: 'POST', body: JSON.stringify(data) }),
  // Create patient with test details (combined endpoint)
  createPatientWithTest: (data: object) =>
    apiRequest('/fieldAgent/create', { method: 'POST', body: JSON.stringify(data) }),
  updatePatient: (id: string, data: object) =>
    apiRequest(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePatient: (id: string) =>
    apiRequest(`/patients/${id}`, { method: 'DELETE' }),
  // Add a new test to an existing patient
  addTestToPatient: (patientId: string, data: object) =>
    apiRequest(`/patients/${patientId}/tests`, { method: 'POST', body: JSON.stringify(data) }),
  searchPatients: (query: string) =>
    apiRequest(`/patients/search?q=${encodeURIComponent(query)}`),

  // Drugs
  getDrugs: () => apiRequest('/drugs'),
  getDrug: (id: string) => apiRequest(`/drugs/${id}`),
  createDrug: (data: object) =>
    apiRequest('/drugs', { method: 'POST', body: JSON.stringify(data) }),
  updateDrug: (id: string, data: object) =>
    apiRequest(`/drugs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDrug: (id: string) =>
    apiRequest(`/drugs/${id}`, { method: 'DELETE' }),

  // Prescriptions
  getPrescriptions: () => apiRequest('/prescriptions'),
  getPrescription: (id: string) => apiRequest(`/prescriptions/${id}`),
  createPrescription: (data: object) =>
    apiRequest('/prescriptions', { method: 'POST', body: JSON.stringify(data) }),
  updatePrescription: (id: string, data: object) =>
    apiRequest(`/prescriptions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Notifications
  getNotifications: () => apiRequest('/notifications'),
  markNotificationRead: (id: string) =>
    apiRequest(`/notifications/${id}/read`, { method: 'PUT' }),

  // Pharmacy
  getPharmacies: () => apiRequest('/pharmacy'),
  getPharmacy: (id: string) => apiRequest(`/pharmacy/${id}`),

  // Communities
  getCommunities: () => apiRequest<{ communities: Community[] }>('/community/all'),
  getCommunity: (id: string) => apiRequest<{ community: Community }>(`/community/${id}`),
  createCommunity: (data: object) =>
    apiRequest<{ community: Community }>('/community', { method: 'POST', body: JSON.stringify(data) }),
  updateCommunity: (id: string | number, data: object) =>
    apiRequest<{ community: Community }>(`/community/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCommunity: (id: string | number) =>
    apiRequest(`/community/${id}`, { method: 'DELETE' }),

  // Visitation
  getVisitations: () => apiRequest('/visitation'),
  createVisitation: (data: object) =>
    apiRequest('/visitation', { method: 'POST', body: JSON.stringify(data) }),

  // Test Types
  getTestTypes: () => apiRequest<{ testTypes: Array<{ _id: string; name: string; allowedResults: string[]; description?: string; isActive: boolean }> }>('/admin/testtypes'),
  getTestTypeAllowedResults: (id: string) => apiRequest<{ allowedResults: string[] }>(`/admin/testtypes/allowed/${id}`),
  createTestType: (data: { name: string; allowedResults: string[] }) =>
    apiRequest('/admin/testtypes', { method: 'POST', body: JSON.stringify(data) }),
  updateTestType: (id: string, data: { name?: string; allowedResults?: string[]; description?: string; isActive?: boolean }) =>
    apiRequest(`/admin/testtypes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTestType: (id: string) =>
    apiRequest(`/admin/testtypes/${id}`, { method: 'DELETE' }),

  // Dashboard - aggregate calls that compute stats from available data
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    try {
      const [communitiesRes, fieldAgentsRes, patientsRes] = await Promise.all([
        api.getCommunities(),
        api.getFieldAgents(),
        api.getPatients(),
      ]);

      // Handle nested response structure
      const commData = communitiesRes.data as any;
      const agentsData = fieldAgentsRes.data as any;
      const patData = patientsRes.data as any;

      const communities = commData?.data?.communities || commData?.communities || [];
      const fieldAgents = agentsData?.agents || agentsData?.data?.agents || agentsData?.fieldAgents || [];
      const patients = patData?.data?.patients || patData?.patients || [];

      // Count total tests from community stats OR patient testDetails
      let totalTests = communities.reduce((sum: number, c: any) => sum + (c.totalTestsConducted || 0), 0);
      if (totalTests === 0) {
        // Fallback: count from patient testDetails
        totalTests = patients.reduce((sum: number, p: any) => sum + (p.testDetails?.length || 0), 0);
      }

      // Find the most recent test date from patient testDetails
      let latestDate = '';
      patients.forEach((p: any) => {
        const tests = p.testDetails || [];
        tests.forEach((t: any) => {
          const d = t.dateConducted || t.dateVisited;
          if (d && (!latestDate || new Date(d) > new Date(latestDate))) {
            latestDate = d;
          }
        });
      });

      const stats: DashboardStats = {
        communities: communities.length,
        fieldAgents: fieldAgents.length,
        tests: totalTests,
        communitiesCovered: communities.filter((c: any) => c.totalTestsConducted > 0).length,
        fieldAgentsAvailable: fieldAgents.length,
        lastTestDate: latestDate
          ? new Date(latestDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
          : 'N/A',
      };

      return { success: true, data: stats };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats',
        data: {
          communities: 0,
          fieldAgents: 0,
          tests: 0,
          communitiesCovered: 0,
          fieldAgentsAvailable: 0,
          lastTestDate: 'N/A',
        },
      };
    }
  },

  getRecentCommunityRecords: async (): Promise<ApiResponse<RecentRecord[]>> => {
    try {
      const [communitiesRes, patientsRes, testTypesRes] = await Promise.all([
        api.getCommunities(),
        api.getPatients(),
        api.getTestTypes(),
      ]);
      // Handle nested response structure
      const commData = communitiesRes.data as any;
      const patData = patientsRes.data as any;
      const testTypesData = testTypesRes.data as any;
      const communities = commData?.data?.communities || commData?.communities || [];
      const patients = patData?.data?.patients || patData?.patients || [];
      const testTypes = testTypesData?.data?.testTypes || testTypesData?.testTypes || [];

      // Build a lookup map of test type ID to name
      const testTypeMap: Record<string, string> = {};
      testTypes.forEach((tt: any) => {
        testTypeMap[tt._id] = tt.name;
      });

      // Build a map of community ID to test results
      const communityStats: Record<string, { 
        positiveTests: Record<string, number>; 
        negativeTests: Record<string, number>;
        totalTests: number;
      }> = {};

      // Initialize for all communities
      communities.forEach((c: any) => {
        communityStats[c._id] = { positiveTests: {}, negativeTests: {}, totalTests: 0 };
      });

      // Aggregate test data from patients
      patients.forEach((p: any) => {
        const commId = p.community?._id || p.community;
        if (commId && communityStats[commId]) {
          const tests = p.testDetails || [];
          tests.forEach((t: any) => {
            // Resolve test type name: check if object with name, otherwise lookup by ID
            let testTypeName: string;
            if (typeof t.testType === 'object' && t.testType?.name) {
              testTypeName = t.testType.name;
            } else if (typeof t.testType === 'string') {
              // It's an ObjectId string - look it up in the map
              testTypeName = testTypeMap[t.testType] || 'Unknown Test';
            } else {
              testTypeName = 'Unknown Test';
            }
            
            const result = (t.testResult || '').toLowerCase().trim();
            
            communityStats[commId].totalTests++;
            
            // Classify result using shared classifier that handles all result types
            const resultClass = classifyResult(result);
            
            if (resultClass === 'positive') {
              communityStats[commId].positiveTests[testTypeName] = (communityStats[commId].positiveTests[testTypeName] || 0) + 1;
            } else if (resultClass === 'negative') {
              communityStats[commId].negativeTests[testTypeName] = (communityStats[commId].negativeTests[testTypeName] || 0) + 1;
            }
          });
        }
      });

      const records: RecentRecord[] = communities.slice(0, 15).map((c: any) => {
        const stats = communityStats[c._id] || { positiveTests: {}, negativeTests: {}, totalTests: 0 };
        
        // Find top positive test type
        const topPositive = Object.entries(stats.positiveTests).sort((a, b) => b[1] - a[1])[0];
        // Find top negative test type
        const topNegative = Object.entries(stats.negativeTests).sort((a, b) => b[1] - a[1])[0];

        return {
          community: `${c.name} ${c.lga}`,
          totalTests: c.totalTestsConducted || stats.totalTests || 0,
          topPositiveTest: topPositive ? `${topPositive[0]} (${topPositive[1]})` : '-',
          topNegativeTest: topNegative ? `${topNegative[0]} (${topNegative[1]})` : '-',
        };
      });

      return { success: true, data: records };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch records',
        data: [],
      };
    }
  },

  // Analytics - compute from patient data
  getCasesPerCommunity: async (params?: Record<string, string>): Promise<ApiResponse<Array<{ label: string; value: number }>>> => {
    try {
      // Fetch communities and patients to compute cases per community
      const [communitiesRes, patientsRes] = await Promise.all([
        api.getCommunities(),
        api.getPatients(),
      ]);

      const commData = communitiesRes.data as any;
      const patData = patientsRes.data as any;
      const communities = commData?.data?.communities || commData?.communities || [];
      let patients = patData?.data?.patients || patData?.patients || [];

      // Apply community filter only - testType and date filters are applied during counting
      if (params?.communityId) {
        patients = patients.filter((p: any) => {
          const commId = p.community?._id || p.community;
          return commId === params.communityId;
        });
      }

      // Count tests per community
      const communityTestCounts: Record<string, { name: string; count: number }> = {};

      communities.forEach((c: any) => {
        communityTestCounts[c._id] = { name: c.name, count: 0 };
      });

      // Count from filtered patients - apply ALL filters to test counting
      patients.forEach((p: any) => {
        const commId = p.community?._id || p.community;
        if (commId && communityTestCounts[commId]) {
          let tests = p.testDetails || [];
          
          // Apply test type filter to count
          if (params?.testType) {
            tests = tests.filter((t: any) => {
              const testTypeName = typeof t.testType === 'object' ? t.testType?.name : t.testType;
              if (!testTypeName) return false;
              return testTypeName.toLowerCase() === params.testType!.toLowerCase();
            });
          }
          
          // Apply date filter - filter tests on or before selected date
          if (params?.date) {
            tests = tests.filter((t: any) => {
              const rawDate = t.dateConducted || t.dateVisited;
              if (!rawDate) return false;
              const testDate = new Date(rawDate).toISOString().split('T')[0];
              return testDate <= params.date!;
            });
          }
          
          communityTestCounts[commId].count += tests.length;
        }
      });

      const chartData = Object.values(communityTestCounts)
        .filter((c) => c.count > 0)
        .map((c) => ({
          label: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
          value: c.count,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);

      return { success: true, data: chartData };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Analytics data not available',
        data: [],
      };
    }
  },

  // Test Rate - compute from patient data
  getTestRatePerType: async (params?: Record<string, string>): Promise<ApiResponse<{ positivePercentage: number; negativePercentage: number }>> => {
    try {
      const patientsRes = await api.getPatients();
      const patData = patientsRes.data as any;
      let patients = patData?.data?.patients || patData?.patients || [];

      // Apply community filter
      if (params?.communityId) {
        patients = patients.filter((p: any) => {
          const commId = p.community?._id || p.community;
          return commId === params.communityId;
        });
      }

      let positiveCount = 0;
      let negativeCount = 0;

      patients.forEach((p: any) => {
        let tests = p.testDetails || [];
        
        // Apply test type filter
        if (params?.testType) {
          tests = tests.filter((t: any) => {
            const testTypeName = typeof t.testType === 'object' ? t.testType?.name : t.testType;
            if (!testTypeName) return false;
            return testTypeName.toLowerCase() === params.testType!.toLowerCase();
          });
        }

        // Apply date filter - count tests on or before selected date
        if (params?.date) {
          tests = tests.filter((t: any) => {
            const rawDate = t.dateConducted || t.dateVisited;
            if (!rawDate) return false;
            const testDate = new Date(rawDate).toISOString().split('T')[0];
            return testDate <= params.date!;
          });
        }

        tests.forEach((test: any) => {
          const result = (test.testResult || '').toLowerCase().trim();
          const resultClass = classifyResult(result);
          if (resultClass === 'positive') {
            positiveCount++;
          } else if (resultClass === 'negative') {
            negativeCount++;
          }
        });
      });

      const total = positiveCount + negativeCount;
      const positivePercentage = total > 0 ? Math.round((positiveCount / total) * 100) : 0;
      const negativePercentage = total > 0 ? Math.round((negativeCount / total) * 100) : 0;

      return { success: true, data: { positivePercentage, negativePercentage } };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Analytics data not available',
        data: { positivePercentage: 0, negativePercentage: 0 },
      };
    }
  },
};

export default api;
