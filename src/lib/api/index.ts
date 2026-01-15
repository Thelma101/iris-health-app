const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  
  register: (data: object) =>
    apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  
  forgotPassword: (email: string) =>
    apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  // Users
  getUsers: () => apiRequest('/users'),
  getUser: (id: string) => apiRequest(`/users/${id}`),
  createUser: (data: object) =>
    apiRequest('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: object) =>
    apiRequest(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id: string) =>
    apiRequest(`/users/${id}`, { method: 'DELETE' }),

  // Patients
  getPatients: () => apiRequest('/patients'),
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

  // Inventory
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
  getCommunities: () => apiRequest('/community/all'),
  createCommunity: (data: object) =>
    apiRequest('/community', { method: 'POST', body: JSON.stringify(data) }),
  updateCommunity: (id: string | number, data: object) =>
    apiRequest(`/community/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCommunity: (id: string | number) =>
    apiRequest(`/community/${id}`, { method: 'DELETE' }),

  // Analytics
  getCasesPerCommunity: () => apiRequest('/analytics/cases-per-community'),
  getFieldOfficers: () => apiRequest('/fieldAgent/all'),
};

export default api;
