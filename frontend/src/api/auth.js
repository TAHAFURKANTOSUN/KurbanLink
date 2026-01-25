import apiClient from './axios';

export const loginAPI = async (email, password) => {
    const response = await apiClient.post('/api/auth/login/', { email, password });
    return response.data;
};

export const refreshTokenAPI = async (refreshToken) => {
    const response = await apiClient.post('/api/auth/refresh/', { refresh: refreshToken });
    return response.data;
};

export const registerAPI = async (payload) => {
    const response = await apiClient.post('/api/auth/register/', payload);
    return response.data;
};

export const fetchMe = async () => {
    const response = await apiClient.get('/api/auth/me/');
    return response.data;
};

export const requestEmailOTP = async (email) => {
    const response = await apiClient.post('/api/auth/email-otp/request/', { email });
    return response.data;
};

export const verifyEmailOTP = async (email, otp) => {
    const response = await apiClient.post('/api/auth/email-otp/verify/', { email, otp });
    return response.data;
};
