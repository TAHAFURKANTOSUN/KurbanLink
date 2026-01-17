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
 * Fetch current user's butcher profile
 */
export const fetchButcherProfile = async () => {
    const response = await apiClient.get('/api/butchers/profiles/');
    // Response might be a list or single object depending on backend
    if (Array.isArray(response.data)) {
        return response.data[0] || null;
    }
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
 * Fetch appointments for current butcher
 */
export const fetchButcherAppointments = async () => {
    const response = await apiClient.get('/api/butchers/appointments/');
    return response.data;
};

/**
 * Approve an appointment
 */
export const approveAppointment = async (id) => {
    const response = await apiClient.post(`/api/butchers/appointments/${id}/approve/`);
    return response.data;
};

/**
 * Reject an appointment
 */
export const rejectAppointment = async (id) => {
    const response = await apiClient.post(`/api/butchers/appointments/${id}/reject/`);
    return response.data;
};

/**
 * Cancel an appointment (if allowed)
 */
export const cancelAppointment = async (id) => {
    const response = await apiClient.post(`/api/butchers/appointments/${id}/cancel/`);
    return response.data;
};
