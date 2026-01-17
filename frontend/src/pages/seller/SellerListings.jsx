import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { fetchMyListings, deleteListing } from '../../api/sellers';
import { getUserIdFromToken } from '../../utils/jwt';
import './Seller.css';

const SellerListings = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadListings = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('access_token');
            const userId = getUserIdFromToken(token);

            const data = await fetchMyListings(userId);
            setListings(data.results || data);
        } catch (err) {
            console.error('Failed to load listings:', err);
            setError('İlanlar yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadListings();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Bu ilanı silmek istediğinize emin misiniz?')) {
            return;
        }

        try {
            await deleteListing(id);
            await loadListings(); // Refresh list
        } catch (err) {
            console.error('Delete failed:', err);
            alert('İlan silinemedi: ' + (err.response?.data?.detail || 'Bilinmeyen hata'));
        }
    };

    if (loading) {
        return (
            <div className="seller-container">
                <div className="seller-header">
                    <h1>İlanlarım</h1>
                    <div className="header-actions">
                        <button onClick={() => navigate('/')} className="back-btn">← Geri</button>
                        <button onClick={logout} className="logout-btn">Çıkış</button>
                    </div>
                </div>
                <div className="page">
                    <div className="page__container">
                        <div className="loading">Yükleniyor...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="seller-container">
                <div className="seller-header">
                    <h1>İlanlarım</h1>
                    <div className="header-actions">
                        <button onClick={() => navigate('/')} className="back-btn">← Geri</button>
                        <button onClick={logout} className="logout-btn">Çıkış</button>
                    </div>
                </div>
                <div className="page">
                    <div className="page__container">
                        <div className="form-card">
                            <p className="error-message">{error}</p>
                            <button onClick={loadListings} className="retry-btn">Tekrar Dene</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="seller-container">
            <div className="seller-header">
                <h1>İlanlarım</h1>
                <div className="header-actions">
                    <button onClick={() => navigate('/seller/listings/new')} className="create-btn">
                        + Yeni İlan
                    </button>
                    <button onClick={() => navigate('/')} className="back-btn">← Geri</button>
                    <button onClick={logout} className="logout-btn">Çıkış</button>
                </div>
            </div>

            <div className="page">
                <div className="page__container listings-container">
                    {listings.length === 0 ? (
                        <div className="form-card">
                            <p className="empty-message">Henüz ilannız yok.</p>
                            <button
                                onClick={() => navigate('/seller/listings/new')}
                                className="create-btn-large"
                            >
                                İlk İlanınızı Oluşturun
                            </button>
                        </div>
                    ) : (
                        <div className="listings-grid">
                            {listings.map(listing => (
                                <div key={listing.id} className="listing-card">
                                    <div
                                        className="listing-info"
                                        onClick={() => navigate(`/animals/${listing.id}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <h3>{listing.breed}</h3>
                                        <span className="type-badge">{listing.animal_type}</span>
                                        <div className="details">
                                            <p><strong>Fiyat:</strong> {listing.price} TL</p>
                                            <p><strong>Konum:</strong> {listing.location}</p>
                                            {listing.age && <p><strong>Yaş:</strong> {listing.age} ay</p>}
                                            {listing.weight && <p><strong>Ağırlık:</strong> {listing.weight} kg</p>}
                                        </div>
                                        <div className="status">
                                            {listing.is_active ? (
                                                <span className="active">Aktif</span>
                                            ) : (
                                                <span className="inactive">Pasif</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="listing-actions">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/seller/listings/${listing.id}/edit`);
                                            }}
                                            className="edit-btn"
                                        >
                                            Düzenle
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(listing.id);
                                            }}
                                            className="delete-btn"
                                        >
                                            Sil
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerListings;
