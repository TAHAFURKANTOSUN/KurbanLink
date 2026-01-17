import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchButcherProfiles } from '../../api/butchers';
import './Butchers.css';

const ButcherList = () => {
    const navigate = useNavigate();
    const [butchers, setButchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadButchers();
    }, []);

    const loadButchers = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchButcherProfiles();
            setButchers(data);
        } catch (err) {
            console.error('Failed to load butchers:', err);
            setError('Kasaplar yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="page">
                <div className="page__container">
                    <div className="butchers-header">
                        <h1>Kasaplar</h1>
                    </div>
                    <div className="loading">Yükleniyor...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page">
                <div className="page__container">
                    <div className="butchers-header">
                        <h1>Kasaplar</h1>
                    </div>
                    <div className="form-card">
                        <p className="error-message">{error}</p>
                        <button onClick={loadButchers} className="submit-btn">Tekrar Dene</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page__container">
                <div className="butchers-header">
                    <h1>Kasaplar</h1>
                    <button onClick={() => navigate('/')} className="back-btn">← Geri</button>
                </div>

                {butchers.length === 0 ? (
                    <div className="form-card">
                        <p className="empty-message">Şu anda kayıtlı kasap bulunmamaktadır.</p>
                    </div>
                ) : (
                    <div className="butcher-grid">
                        {butchers.map(butcher => (
                            <div
                                key={butcher.id}
                                className="butcher-card"
                                onClick={() => navigate(`/butchers/${butcher.id}`)}
                            >
                                <div className="butcher-info">
                                    <h2>{butcher.business_name}</h2>
                                    <div className="butcher-location">
                                        📍 {butcher.city}
                                    </div>
                                    <div className="butcher-experience">
                                        ⭐ {butcher.experience_years} yıl deneyim
                                    </div>
                                    {butcher.services && butcher.services.length > 0 && (
                                        <div className="butcher-services">
                                            <strong>Hizmetler:</strong>
                                            <ul>
                                                {butcher.services.map((service, idx) => (
                                                    <li key={idx}>{service}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {butcher.rating && (
                                        <div className="butcher-rating">
                                            ⭐ {butcher.rating.toFixed(1)}
                                        </div>
                                    )}
                                </div>
                                <button
                                    className="appointment-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/butchers/${butcher.id}`);
                                    }}
                                >
                                    Randevu Al
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ButcherList;
