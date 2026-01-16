import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { fetchAllAnimals, fetchAnimalImages } from '../api/animals';
import './Favorites.css';

const Favorites = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { favorites, loading: favoritesLoading, error: favoritesError, refresh } = useFavorites();

    const [listings, setListings] = useState([]);
    const [listingImages, setListingImages] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadFavoriteListings = async () => {
        if (favoritesLoading) return;

        setLoading(true);
        setError(null);

        try {
            // Get all animals
            const allAnimals = await fetchAnimals();

            // Filter to only favorited ones
            const favoriteListingIds = favorites.map(fav => fav.listing);
            const favoriteListings = allAnimals.filter(animal => favoriteListingIds.includes(animal.id));

            setListings(favoriteListings);

            // Fetch images for favorite listings
            const imagePromises = favoriteListings.map(listing =>
                fetchAnimalImages(listing.id)
                    .then(images => ({ listingId: listing.id, images }))
                    .catch(() => ({ listingId: listing.id, images: [] }))
            );

            const allImages = await Promise.all(imagePromises);

            // Build images map
            const imagesMap = {};
            allImages.forEach(({ listingId, images }) => {
                const primaryImage = images.find(img => img.is_primary);
                imagesMap[listingId] = primaryImage || images[0] || null;
            });

            setListingImages(imagesMap);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to load favorite listings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!favoritesLoading) {
            loadFavoriteListings();
        }
    }, [favorites, favoritesLoading]);

    if (favoritesLoading || loading) {
        return (
            <div className="favorites-container">
                <div className="favorites-header">
                    <h1>Favorilerim</h1>
                    <div className="header-actions">
                        <button onClick={() => navigate('/')} className="listings-link-btn">Tüm İlanlar</button>
                        <button onClick={logout} className="logout-btn">Çıkış</button>
                    </div>
                </div>
                <div className="loading">Favoriler yükleniyor...</div>
            </div>
        );
    }

    if (favoritesError || error) {
        return (
            <div className="favorites-container">
                <div className="favorites-header">
                    <h1>My Favorites</h1>
                    <div className="header-actions">
                        <button onClick={() => navigate('/')} className="listings-link-btn">Tüm İlanlar</button>
                        <button onClick={logout} className="logout-btn">Çıkış</button>
                    </div>
                </div>
                <div className="error-container">
                    <p className="error">{favoritesError || error}</p>
                    <button onClick={() => { refresh(); loadFavoriteListings(); }}>Tekrar Dene</button>
                </div>
            </div>
        );
    }

    if (listings.length === 0) {
        return (
            <div className="favorites-container">
                <div className="favorites-header">
                    <h1>My Favorites</h1>
                    <div className="header-actions">
                        <button onClick={() => navigate('/')} className="listings-link-btn">Tüm İlanlar</button>
                        <button onClick={logout} className="logout-btn">Çıkış</button>
                    </div>
                </div>
                <div className="empty-state">
                    <h2>Henüz Favori Yok</h2>
                    <p>İlanları gezin ve favorilere ekleyerek burada görün!</p>
                    <button onClick={() => navigate('/')}>İlanları Görüntüle</button>
                </div>
            </div>
        );
    }

    return (
        <div className="favorites-container">
            <div className="favorites-header">
                <h1>Favorilerim ({listings.length})</h1>
                <div className="header-actions">
                    <button onClick={() => navigate('/')} className="listings-link-btn">Tüm İlanlar</button>
                    <button onClick={logout} className="logout-btn">Çıkış</button>
                </div>
            </div>

            <div className="favorites-grid">
                {listings.map(listing => {
                    const image = listingImages[listing.id];

                    return (
                        <div
                            key={listing.id}
                            className="favorite-card"
                            onClick={() => navigate(`/animals/${listing.id}`)}
                        >
                            <div className="favorite-image">
                                {image ? (
                                    <img src={image.image_url} alt={`${listing.animal_type} ${listing.breed}`} />
                                ) : (
                                    <div className="image-placeholder">Resim Yok</div>
                                )}
                            </div>

                            <div className="favorite-details">
                                <h3>{listing.animal_type} - {listing.breed}</h3>

                                <div className="favorite-info">
                                    <div className="info-row">
                                        <span className="label">Fiyat:</span>
                                        <span className="value">${listing.price}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Konum:</span>
                                        <span className="value">{listing.location}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Satıcı:</span>
                                        <span className="value seller">{listing.seller_email}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Favorites;
