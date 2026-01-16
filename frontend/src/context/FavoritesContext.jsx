import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { fetchFavorites, createFavorite, deleteFavorite } from '../api/favorites';

const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toggleLoading, setToggleLoading] = useState({}); // Track per-listing loading
    const [error, setError] = useState(null);

    const loadFavorites = async () => {
        if (!isAuthenticated) return;

        setLoading(true);
        setError(null);
        try {
            const data = await fetchFavorites();
            setFavorites(data);
        } catch (err) {
            console.error('Failed to load favorites:', err);
            setError(err.response?.data?.detail || 'Failed to load favorites');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            loadFavorites();
        } else {
            // Clear favorites when not authenticated
            setFavorites([]);
            setError(null);
        }
    }, [isAuthenticated]);

    const isFavorited = (listingId) => {
        return favorites.some(fav => fav.animal === listingId);
    };

    const getFavoriteId = (listingId) => {
        const favorite = favorites.find(fav => fav.animal === listingId);
        return favorite?.id || null;
    };

    const toggleFavorite = async (listingId) => {
        // Prevent concurrent toggles for same listing
        if (toggleLoading[listingId]) return;

        setToggleLoading(prev => ({ ...prev, [listingId]: true }));

        try {
            if (isFavorited(listingId)) {
                // Remove favorite
                const favoriteId = getFavoriteId(listingId);
                await deleteFavorite(favoriteId);
                setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
            } else {
                // Add favorite
                const newFavorite = await createFavorite(listingId);
                setFavorites(prev => [...prev, newFavorite]);
            }
            return { success: true };
        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.response?.data?.listing?.[0] || 'Failed to update favorite';
            return { success: false, error: errorMessage };
        } finally {
            setToggleLoading(prev => ({ ...prev, [listingId]: false }));
        }
    };

    const value = {
        favorites,
        loading,
        error,
        isFavorited,
        getFavoriteId,
        toggleFavorite,
        toggleLoading,
        refresh: loadFavorites,
    };

    return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within FavoritesProvider');
    }
    return context;
};
