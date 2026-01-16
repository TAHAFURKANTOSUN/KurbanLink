import apiClient from './axios';

export const fetchFavorites = async () => {
    const response = await apiClient.get('/api/favorites/');
    return response.data;
};

export const createFavorite = async (listingId) => {
    const response = await apiClient.post('/api/favorites/', {
        listing: listingId,
    });
    return response.data;
};

export const deleteFavorite = async (favoriteId) => {
    await apiClient.delete(`/api/favorites/${favoriteId}/`);
};
