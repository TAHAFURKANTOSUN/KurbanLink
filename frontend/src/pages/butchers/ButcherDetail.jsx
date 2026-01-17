import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { fetchButcherProfile, createAppointment } from '../../api/butchers';
import { fetchMyListings } from '../../api/sellers';
import './Butchers.css';

const TIME_SLOTS = [
    '09:00:00', '09:30:00', '10:00:00', '10:30:00',
    '11:00:00', '11:30:00', '12:00:00', '12:30:00',
    '13:00:00', '13:30:00', '14:00:00', '14:30:00',
    '15:00:00', '15:30:00', '16:00:00', '16:30:00',
    '17:00:00'
];

const ButcherDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [butcher, setButcher] = useState(null);
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        date: '',
        time: '',
        listing: '',
        note: ''
    });

    useEffect(() => {
        loadButcherAndListings();
    }, [id]);

    const loadButcherAndListings = async () => {
        setLoading(true);
        setError(null);

        try {
            const butcherData = await fetchButcherProfile(id);
            setButcher(butcherData);

            // If user is seller, load their listings
            if (user?.roles?.includes('SELLER')) {
                try {
                    const listingsData = await fetchMyListings(user.id);
                    setListings(listingsData.results || listingsData);
                } catch (err) {
                    console.error('Failed to load listings:', err);
                }
            }
        } catch (err) {
            console.error('Failed to load butcher:', err);
            setError('Kasap bilgileri yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            const appointmentData = {
                butcher: parseInt(id),
                date: formData.date,
                time: formData.time,
                note: formData.note
            };

            if (formData.listing) {
                appointmentData.listing = parseInt(formData.listing);
            }

            await createAppointment(appointmentData);
            setSuccess(true);
            setFormData({ date: '', time: '', listing: '', note: '' });
        } catch (err) {
            console.error('Failed to create appointment:', err);
            const errorMsg = err.response?.data?.detail
                || err.response?.data?.error
                || 'Randevu oluşturulamadı';
            setError(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="page">
                <div className="page__container">
                    <div className="loading">Yükleniyor...</div>
                </div>
            </div>
        );
    }

    if (!butcher) {
        return (
            <div className="page">
                <div className="page__container">
                    <div className="form-card">
                        <p className="error-message">Kasap bulunamadı</p>
                        <button onClick={() => navigate('/butchers')} className="submit-btn">
                            Kasaplar Listesine Dön
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page__container">
                <div className="butcher-detail-header">
                    <h1>{butcher.business_name}</h1>
                    <button onClick={() => navigate('/butchers')} className="back-btn">← Kasaplar</button>
                </div>

                <div className="butcher-detail-card">
                    <div className="butcher-detail-info">
                        <div className="info-row">
                            <strong>Şehir:</strong>
                            <span>{butcher.city}</span>
                        </div>
                        <div className="info-row">
                            <strong>Deneyim:</strong>
                            <span>{butcher.experience_years} yıl</span>
                        </div>
                        {butcher.services && butcher.services.length > 0 && (
                            <div className="info-row">
                                <strong>Hizmetler:</strong>
                                <div className="service-tags">
                                    {butcher.services.map((service, idx) => (
                                        <span key={idx} className="service-tag">{service}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {butcher.rating && (
                            <div className="info-row">
                                <strong>Değerlendirme:</strong>
                                <span>⭐ {butcher.rating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="appointment-section">
                    <h2>Randevu Oluştur</h2>

                    {success && (
                        <div className="success-message">
                            ✅ Randevu talebiniz gönderildi. Kasap onayı bekleniyor.
                            <button onClick={() => navigate('/profile')} className="link-btn">
                                Profilime Git
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="error-message">{error}</div>
                    )}

                    <form onSubmit={handleSubmit} className="appointment-form">
                        <div className="form-group">
                            <label htmlFor="date">Tarih *</label>
                            <input
                                type="date"
                                id="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="time">Saat *</label>
                            <select
                                id="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                required
                            >
                                <option value="">Saat seçin</option>
                                {TIME_SLOTS.map(slot => (
                                    <option key={slot} value={slot}>
                                        {slot.substring(0, 5)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {user?.roles?.includes('SELLER') && listings.length > 0 && (
                            <div className="form-group">
                                <label htmlFor="listing">İlan (Opsiyonel)</label>
                                <select
                                    id="listing"
                                    value={formData.listing}
                                    onChange={(e) => setFormData({ ...formData, listing: e.target.value })}
                                >
                                    <option value="">İlan seçin (opsiyonel)</option>
                                    {listings.map(listing => (
                                        <option key={listing.id} value={listing.id}>
                                            {listing.breed} - {listing.animal_type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="note">Not (Opsiyonel)</label>
                            <textarea
                                id="note"
                                value={formData.note}
                                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                rows="3"
                                placeholder="Randevu hakkında not ekleyebilirsiniz..."
                            />
                        </div>

                        <button type="submit" disabled={submitting} className="submit-btn">
                            {submitting ? 'Gönderiliyor...' : 'Randevu Talebi Gönder'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ButcherDetail;
