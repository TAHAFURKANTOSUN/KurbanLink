import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { fetchAnimal, fetchAnimalImages } from '../api/animals';
import './AnimalDetail.css';

const AnimalDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { isFavorited, toggleFavorite, toggleLoading } = useFavorites();

    const [listing, setListing] = useState(null);
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [favoriteError, setFavoriteError] = useState(null);

    // Use ref to track latest request ID to prevent race conditions
    const requestIdRef = useRef(0);

    const loadListing = async () => {
        // Increment request ID for this new request
        const currentRequestId = ++requestIdRef.current;

        // Immediately clear stale data and set loading state
        setListing(null);
        setImages([]);
        setSelectedImage(null);
        setLoading(true);
        setError(null);
        setNotFound(false);

        try {
            const [listingData, imagesData] = await Promise.all([
                fetchAnimal(id),
                fetchAnimalImages(id).catch(() => []) // Don't fail on image errors
            ]);

            // Only update state if this is still the latest request
            if (currentRequestId === requestIdRef.current) {
                setListing(listingData);
                setImages(imagesData);

                // Set primary image or first image
                const primary = imagesData.find(img => img.is_primary);
                setSelectedImage(primary || imagesData[0] || null);
            }
        } catch (err) {
            // Only update error state if this is still the latest request
            if (currentRequestId === requestIdRef.current) {
                if (err.response?.status === 404) {
                    setNotFound(true);
                } else {
                    setError(err.response?.data?.detail || 'İlan yüklenemedi.');
                }
            }
        } finally {
            // Only update loading state if this is still the latest request
            if (currentRequestId === requestIdRef.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        loadListing();
    }, [id]); // Critical: id dependency ensures fresh load on navigation

    const handleFavoriteToggle = async () => {
        setFavoriteError(null);
        const result = await toggleFavorite(parseInt(id));
        if (!result.success) {
            setFavoriteError(result.error);
            setTimeout(() => setFavoriteError(null), 3000);
        }
    };

    if (loading) {
        return (
            <div className="detail-container">
                <div className="detail-header">
                    <button onClick={() => navigate('/')} className="back-btn">← İlanlara Dön</button>
                    <div className="header-actions">
                        <button onClick={() => navigate('/favorites')} className="favorites-link-btn">Favorilerim</button>
                        <button onClick={logout} className="logout-btn">Çıkış</button>
                    </div>
                </div>
                <div className="loading">İlan yükleniyor...</div>
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="detail-container">
                <div className="detail-header">
                    <button onClick={() => navigate('/')} className="back-btn">← İlanlara Dön</button>
                    <div className="header-actions">
                        <button onClick={() => navigate('/favorites')} className="favorites-link-btn">Favorilerim</button>
                        <button onClick={logout} className="logout-btn">Çıkış</button>
                    </div>
                </div>
                <div className="not-found">
                    <h2>İlan Bulunamadı</h2>
                    <p>Aradığınız ilan bulunamadı veya kaldırılmış.</p>
                    <button onClick={() => navigate('/')}>İlanlara Dön</button>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="detail-container">
                <div className="detail-header">
                    <button onClick={() => navigate('/')} className="back-btn">← İlanlara Dön</button>
                    <div className="header-actions">
                        <button onClick={() => navigate('/favorites')} className="favorites-link-btn">Favorilerim</button>
                        <button onClick={logout} className="logout-btn">Çıkış</button>
                    </div>
                </div>
                <div className="error-container">
                    <p className="error">{error}</p>
                    <button onClick={loadListing}>Tekrar Dene</button>
                </div>
            </div>
        );
    }

    const favorited = isFavorited(parseInt(id));
    const isTogglingFavorite = toggleLoading[id];

    return (
        <div className="detail-container">
            <div className="detail-header">
                <button onClick={() => navigate('/')} className="back-btn">← İlanlara Dön</button>
                <div className="header-actions">
                    <button onClick={() => navigate('/favorites')} className="favorites-link-btn">Favorilerim</button>
                    <button onClick={logout} className="logout-btn">Çıkış</button>
                </div>
            </div>

            <div className="detail-content">
                <div className="detail-gallery">
                    <div className="main-image">
                        {selectedImage ? (
                            <img src={selectedImage.image_url} alt={`${listing.animal_type} ${listing.breed}`} />
                        ) : (
                            <div className="image-placeholder-large">Resim Yok</div>
                        )}
                    </div>

                    {images.length > 1 && (
                        <div className="thumbnails">
                            {images.map((image, index) => (
                                <div
                                    key={index}
                                    className={`thumbnail ${selectedImage?.image_url === image.image_url ? 'active' : ''}`}
                                    onClick={() => setSelectedImage(image)}
                                >
                                    <img src={image.image_url} alt={`Thumbnail ${index + 1}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="detail-info">
                    <div className="title-actions">
                        <h1>{listing.animal_type} - {listing.breed}</h1>
                        <button
                            className={`favorite-btn-large ${favorited ? 'favorited' : ''}`}
                            onClick={handleFavoriteToggle}
                            disabled={isTogglingFavorite}
                            title={favorited ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                        >
                            {favorited ? '★ Favorilerde' : '☆ Favorilere Ekle'}
                        </button>
                    </div>

                    {favoriteError && (
                        <div className="inline-error">{favoriteError}</div>
                    )}

                    <div className="info-grid">
                        <div className="info-item">
                            <span className="label">Fiyat</span>
                            <span className="value price">${listing.price}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Konum</span>
                            <span className="value">{listing.location}</span>
                        </div>
                        {listing.age && (
                            <div className="info-item">
                                <span className="label">Yaş</span>
                                <span className="value">{listing.age} yaşında</span>
                            </div>
                        )}
                        {listing.weight && (
                            <div className="info-item">
                                <span className="label">Ağırlık</span>
                                <span className="value">{listing.weight} kg</span>
                            </div>
                        )}
                        <div className="info-item">
                            <span className="label">Satıcı</span>
                            <span className="value seller">{listing.seller_email}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">Eklenme Tarihi</span>
                            <span className="value">{new Date(listing.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {listing.description && (
                        <div className="description-section">
                            <h3>Açıklama</h3>
                            <p>{listing.description}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnimalDetail;
