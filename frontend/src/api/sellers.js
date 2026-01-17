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
 * Fetch listings owned by current user (seller)
 */
export const fetchMyListings = async (userId) => {
    // Backend may support ?seller={userId} filter
    // If not, fetch all and filter client-side
    try {
        const response = await apiClient.get('/api/animals/', {
            params: { seller: userId }
        });
        return response.data;
    } catch (error) {
        // If filter not supported, fetch all pages and filter
        if (error.response?.status === 400) {
            const allListings = [];
            let page = 1;
            let hasMore = true;

            while (hasMore) {
                const response = await apiClient.get('/api/animals/', {
                    params: { page }
                });
                allListings.push(...response.data.results);
                hasMore = response.data.next !== null;
                page++;
            }

            return {
                results: allListings.filter(listing => listing.seller === userId),
                count: allListings.filter(listing => listing.seller === userId).length
            };
        }
        throw error;
    }
};

/**
 * Create a new animal listing
 */
export const createListing = async (data) => {
    const response = await apiClient.post('/api/animals/', data);
    return response.data;
};

/**
 * Update an existing listing
 */
export const updateListing = async (id, data) => {
    const response = await apiClient.patch(`/api/animals/${id}/`, data);
    return response.data;
};

/**
 * Delete (or deactivate) a listing
 */
export const deleteListing = async (id) => {
    const response = await apiClient.delete(`/api/animals/${id}/`);
    return response.data;
};

/**
 * Upload images for a listing
 * Uploads multiple images sequentially
 */
export const uploadListingImages = async (listingId, images) => {
    const uploadResults = [];

    for (const image of images) {
        const formData = new FormData();
        formData.append('image', image);
        formData.append('listing', listingId);

        try {
            const response = await apiClient.post(
                `/api/animals/${listingId}/upload-image/`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            uploadResults.push({ success: true, data: response.data, file: image.name });
        } catch (error) {
            uploadResults.push({
                success: false,
                error: error.response?.data?.detail || 'Upload failed',
                file: image.name
            });
        }
    }

    return uploadResults;
};

/**
 * Fetch listing details
 */
export const fetchListingDetails = async (id) => {
    const response = await apiClient.get(`/api/animals/${id}/`);
    return response.data;
};
