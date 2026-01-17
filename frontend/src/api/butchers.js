import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Fetch all butcher profiles
 */
export const fetchButcherProfiles = async () => {
    const response = await apiClient.get('/api/butchers/profiles/');
    return response.data;
};

/**
 * Fetch single butcher profile by ID
 */
export const fetchButcherProfile = async (id) => {
    const response = await apiClient.get(`/api/butchers/profiles/${id}/`);
    return response.data;
};

/**
 * Fetch current user's butcher profile (for ButcherProfile page)
 */
export const fetchMyButcherProfile = async () => {
    const response = await apiClient.get('/api/butchers/profiles/me/');
    return response.data;
};

/**
 * Create a new butcher profile
 */
export const createButcherProfile = async (data) => {
    const response = await apiClient.post('/api/butchers/profiles/', data);
    return response.data;
};

/**
 * Update butcher profile
 */
export const updateButcherProfile = async (id, data) => {
    const response = await apiClient.patch(`/api/butchers/profiles/${id}/`, data);
    return response.data;
};

/**
 * Create a new appointment
 */
export const createAppointment = async (appointmentData) => {
    const response = await apiClient.post('/api/butchers/appointments/', appointmentData);
    return response.data;
};

/**
 * Fetch all appointments (for butcher)
 */
export const fetchAppointments = async () => {
    const response = await apiClient.get('/api/butchers/appointments/');
    return response.data;
};

/**
 * Fetch appointments for current butcher (alias)
 */
export const fetchButcherAppointments = async () => {
    const response = await apiClient.get('/api/butchers/appointments/');
    return response.data;
};

/**
 * Approve an appointment
 */
export const approveAppointment = async (appointmentId) => {
    const response = await apiClient.post(`/api/butchers/appointments/${appointmentId}/approve/`);
    return response.data;
};

/**
 * Reject an appointment
 */
export const rejectAppointment = async (appointmentId) => {
    const response = await apiClient.post(`/api/butchers/appointments/${appointmentId}/reject/`);
    return response.data;
};

/**
 * Cancel an appointment
 */
export const cancelAppointment = async (appointmentId) => {
    const response = await apiClient.post(`/api/butchers/appointments/${appointmentId}/cancel/`);
    return response.data;
};
