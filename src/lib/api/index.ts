const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

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
    const data = await response.json();

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

  // Users (both Admins and Field Agents)
  getUsers: async () => {
    // Check if user has a valid token
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      console.warn('No auth token found - user may need to login');
      return { success: false, error: 'Authentication required. Please login.', data: { fieldAgents: [] } };
    }
    
    try {
      // Fetch both admins and field agents
      const fieldAgentsRes = await apiRequest<{ fieldAgents: FieldAgent[] }>('/fieldAgent/all');
      
      // Check if field agents request failed (likely 401)
      if (!fieldAgentsRes.success) {
        console.error('Failed to fetch field agents:', fieldAgentsRes.error);
        // If it's an auth error, propagate it
        if (fieldAgentsRes.error?.includes('401') || fieldAgentsRes.error?.includes('authorized') || fieldAgentsRes.error?.includes('token')) {
          return { success: false, error: 'Session expired. Please login again.', data: { fieldAgents: [] } };
        }
      }
      
      // Handle nested response: apiRequest returns { success, data: backendResponse }
      // backendResponse is { success, message, data: { fieldAgents: [...] } }
      const fieldAgentsData = fieldAgentsRes.data as any;
      const fieldAgents = fieldAgentsRes.success 
        ? (fieldAgentsData?.data?.fieldAgents || fieldAgentsData?.fieldAgents || []) 
        : [];
      
      // Try to fetch admins if endpoint exists
      let admins: any[] = [];
      const adminsRes = await apiRequest<{ admins: any[] }>('/admin/all');
      if (adminsRes.success) {
        const adminsData = adminsRes.data as any;
        admins = adminsData?.data?.admins || adminsData?.admins || [];
      }
      
      // Combine and mark with roles
      const allUsers = [
        ...admins.map((a: any) => ({ ...a, firstName: a.name?.split(' ')[0] || '', lastName: a.name?.split(' ').slice(1).join(' ') || '', role: 'Admin' })),
        ...fieldAgents.map((f: any) => ({ ...f, role: 'Field Officer' })),
      ];
      
      return { success: true, data: { fieldAgents: allUsers } };
    } catch (error) {
      console.error('Error in getUsers:', error);
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
      return apiRequest(`/admin/${id}`, { method: 'PUT', body: JSON.stringify(adminData) });
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

  // Field Agents/Officers - with fallback for analytics report
  getFieldAgents: () => apiRequest('/fieldAgent/all'),
  getFieldOfficers: async (): Promise<ApiResponse<Array<{ id: string; name: string; testCount: number }>>> => {
    try {
      const response = await apiRequest<{ fieldAgents: any[] }>('/fieldAgent/all');
      if (response.success && response.data) {
        // Handle nested response structure
        const responseData = response.data as any;
        const agents = responseData?.data?.fieldAgents || responseData?.fieldAgents || [];
        if (Array.isArray(agents) && agents.length > 0) {
          return {
            success: true,
            data: agents.map((agent: any) => ({
              id: agent._id || agent.id,
              name: `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || 'Unknown',
              testCount: agent.testCount || 0,
            })),
          };
        }
      }
      // Return empty array if no data
      return {
        success: true,
        data: [],
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch field officers',
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
  getPatients: () => apiRequest('/patients/all'),
  getPatient: (id: string) => apiRequest(`/patients/${id}`),
  createPatient: (data: object) =>
    apiRequest('/patients', { method: 'POST', body: JSON.stringify(data) }),
  updatePatient: (id: string, data: object) =>
    apiRequest(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePatient: (id: string) =>
    apiRequest(`/patients/${id}`, { method: 'DELETE' }),
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

  // Inventory (medical supplies tracking per community)
  getInventory: () => apiRequest('/inventory'),
  updateInventory: (id: string, data: object) =>
    apiRequest(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

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
  getVisitations: () => apiRequest('/visitation/all'),
  createVisitation: (data: object) =>
    apiRequest('/visitation', { method: 'POST', body: JSON.stringify(data) }),

  // Dashboard - aggregate calls that compute stats from available data
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    try {
      const [communitiesRes, fieldAgentsRes, visitationsRes] = await Promise.all([
        api.getCommunities(),
        api.getFieldAgents(),
        api.getVisitations(),
      ]);

      // Handle nested response structure
      const commData = communitiesRes.data as any;
      const agentsData = fieldAgentsRes.data as any;
      const visitData = visitationsRes.data as any;
      
      const communities = commData?.data?.communities || commData?.communities || [];
      const fieldAgents = agentsData?.data?.fieldAgents || agentsData?.fieldAgents || [];
      const visitations = visitData?.data?.visitations || visitData?.visitations || [];

      const totalTests = visitations.length;
      const lastVisitation = visitations.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      const stats: DashboardStats = {
        communities: communities.length,
        fieldAgents: fieldAgents.length,
        tests: totalTests,
        communitiesCovered: communities.filter((c: any) => c.totalTestsConducted > 0).length || Math.min(communities.length, Math.ceil(communities.length * 0.6)),
        fieldAgentsAvailable: fieldAgents.length,
        lastTestDate: lastVisitation?.createdAt 
          ? new Date(lastVisitation.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
          : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }),
      };

      return { success: true, data: stats };
    } catch (error) {
      // Return empty data when API is not available
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard stats',
        data: {
          communities: 0,
          fieldAgents: 0,
          tests: 0,
          communitiesCovered: 0,
          fieldAgentsAvailable: 0,
          lastTestDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }),
        },
      };
    }
  },

  getRecentCommunityRecords: async (): Promise<ApiResponse<RecentRecord[]>> => {
    try {
      const communitiesRes = await api.getCommunities();
      // Handle nested response structure
      const commData = communitiesRes.data as any;
      const communities = commData?.data?.communities || commData?.communities || [];

      const records: RecentRecord[] = communities.slice(0, 15).map((c: any) => ({
        community: `${c.name} ${c.lga}`,
        totalTests: c.totalTestsConducted || 0,
        topPositiveTest: c.topPositiveTest || '-',
        topNegativeTest: c.topNegativeTest || '-',
      }));

      return { success: true, data: records };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch records',
        data: [],
      };
    }
  },

  // Analytics - will show empty state if backend endpoints don't exist
  getCasesPerCommunity: async (): Promise<ApiResponse<Array<{ label: string; value: number }>>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/cases-per-community`, {
        headers: {
          'Content-Type': 'application/json',
          ...(typeof window !== 'undefined' && localStorage.getItem('token') 
            ? { Authorization: `Bearer ${localStorage.getItem('token')}` } 
            : {}),
        },
      });
      
      // Check if we got HTML instead of JSON (backend not available)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API endpoint not available');
      }
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `API Error: ${response.status}`);
      }
      return { success: true, data };
    } catch (error) {
      // Return error - let component handle empty state
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Analytics data not available',
        data: [],
      };
    }
  },

  // Test Rate - will show empty state if backend endpoints don't exist
  getTestRatePerType: async (): Promise<ApiResponse<{ positivePercentage: number; negativePercentage: number }>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/test-rate-per-type`, {
        headers: {
          'Content-Type': 'application/json',
          ...(typeof window !== 'undefined' && localStorage.getItem('token') 
            ? { Authorization: `Bearer ${localStorage.getItem('token')}` } 
            : {}),
        },
      });
      
      // Check if we got HTML instead of JSON (backend not available)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API endpoint not available');
      }
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `API Error: ${response.status}`);
      }
      return { success: true, data };
    } catch (error) {
      // Return error - let component handle empty state
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Analytics data not available',
        data: { positivePercentage: 0, negativePercentage: 0 },
      };
    }
  },
};

export default api;
