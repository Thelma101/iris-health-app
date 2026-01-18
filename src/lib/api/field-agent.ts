const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

async function fieldAgentRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('fieldAgentToken') : null;

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

export const fieldAgentApi = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    fieldAgentRequest('/fieldAgent/login', { method: 'POST', body: JSON.stringify(credentials) }),

  getProfile: () => fieldAgentRequest('/fieldAgent/profile'),
  
  updateProfile: (data: object) =>
    fieldAgentRequest('/fieldAgent/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // Communities (field agent's assigned communities)
  getMyCommunities: () => fieldAgentRequest('/community/all'),
  getCommunity: (id: string) => fieldAgentRequest(`/community/${id}`),

  // Patients
  getPatients: () => fieldAgentRequest('/patients'),
  getPatient: (id: string) => fieldAgentRequest(`/patients/${id}`),
  createPatient: (data: object) =>
    fieldAgentRequest('/patients', { method: 'POST', body: JSON.stringify(data) }),
  updatePatient: (id: string, data: object) =>
    fieldAgentRequest(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  searchPatients: (query: string) =>
    fieldAgentRequest(`/patients/search?q=${encodeURIComponent(query)}`),

  // Visitations (Tests)
  getMyVisitations: () => fieldAgentRequest('/visitation'),
  getVisitation: (id: string) => fieldAgentRequest(`/visitation/${id}`),
  createVisitation: (data: object) =>
    fieldAgentRequest('/visitation', { method: 'POST', body: JSON.stringify(data) }),
  getVisitationsByPatient: (patientId: string) =>
    fieldAgentRequest(`/visitation/${patientId}`),
  getVisitationsByCommunity: (communityId: string) =>
    fieldAgentRequest(`/visitation/com/${communityId}`),

  // Dashboard stats
  getDashboardStats: async (): Promise<ApiResponse<{
    totalTests: number;
    totalPatients: number;
    totalCommunities: number;
    lastTestDate: string;
  }>> => {
    try {
      const [visitationsRes, patientsRes, communitiesRes] = await Promise.all([
        fieldAgentApi.getMyVisitations(),
        fieldAgentApi.getPatients(),
        fieldAgentApi.getMyCommunities(),
      ]);

      const visitations = (visitationsRes.data as any)?.data?.visitations || 
                          (visitationsRes.data as any)?.visitations || [];
      const patients = (patientsRes.data as any)?.data?.patients || 
                       (patientsRes.data as any)?.patients || [];
      const communities = (communitiesRes.data as any)?.data?.communities || 
                          (communitiesRes.data as any)?.communities || [];

      const lastVisitation = visitations.sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

      return {
        success: true,
        data: {
          totalTests: visitations.length,
          totalPatients: patients.length,
          totalCommunities: communities.length,
          lastTestDate: lastVisitation?.createdAt
            ? new Date(lastVisitation.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              }).replace(',', '')
            : 'N/A',
        },
      };
    } catch (error) {
      return { success: false, error: 'Failed to fetch dashboard stats' };
    }
  },

  // Offline sync helpers
  syncOfflineData: async (offlineData: any[]) => {
    const results = [];
    for (const item of offlineData) {
      try {
        let res;
        switch (item.type) {
          case 'visitation':
            res = await fieldAgentApi.createVisitation(item.data);
            break;
          case 'patient':
            res = await fieldAgentApi.createPatient(item.data);
            break;
          default:
            res = { success: false, error: 'Unknown data type' };
        }
        results.push({ id: item.id, ...res });
      } catch (error) {
        results.push({ id: item.id, success: false, error: 'Sync failed' });
      }
    }
    return results;
  },
};

export default fieldAgentApi;
