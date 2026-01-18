import apiClient from './axios';

/**
 * Fetch partnership listings with optional filters
 * @param {Object} params - Query parameters (city, has_animal)
 */
export const fetchPartnerships = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `/api/partnerships/?${query}` : '/api/partnerships/';
    const response = await apiClient.get(url);
    return response.data;
};

/**
 * Create a new partnership listing
 * @param {Object} data - Partnership data (city, person_count, animal, description)
 */
export const createPartnership = async (data) => {
    const response = await apiClient.post('/api/partnerships/', data);
    return response.data;
};

/**
 * Close a partnership listing
 * @param {number} id - Partnership ID
 */
export const closePartnership = async (id) => {
    const response = await apiClient.post(`/api/partnerships/${id}/close/`);
    return response.data;
};
