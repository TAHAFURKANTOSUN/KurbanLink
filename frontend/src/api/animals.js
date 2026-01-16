import apiClient from './axios';

// Fetch a single page of animals
export const fetchAnimals = async (page = 1) => {
    const response = await apiClient.get(`/api/animals/?page=${page}`);
    return response.data;  // Returns { count, next, previous, results }
};

// Fetch ALL animals by following pagination
export const fetchAllAnimals = async () => {
    let allAnimals = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        const data = await fetchAnimals(page);
        allAnimals = [...allAnimals, ...data.results];

        // Check if there's a next page
        hasMore = data.next !== null;
        page++;
    }

    return allAnimals;
};

export const fetchAnimal = async (id) => {
    const response = await apiClient.get(`/api/animals/${id}/`);
    return response.data;
};

export const fetchAnimalImages = async (listingId) => {
    const response = await apiClient.get(`/api/animals/${listingId}/images/`);
    return response.data;
};
