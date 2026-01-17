import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMyButcherProfile, createButcherProfile, updateButcherProfile } from '../../api/butchers';
import './Butcher.css';

const ButcherProfile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState({
        business_name: '',
        city: '',
        services: '',
        price_range: '',
        experience_years: ''
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const data = await fetchMyButcherProfile();
            if (data) {
                setProfile(data);
                setFormData({
                    business_name: data.business_name || '',
                    city: data.city || '',
                    services: Array.isArray(data.services) ? data.services.join(', ') : '',
                    price_range: data.price_range || '',
                    experience_years: data.experience_years || ''
                });
            }
        } catch (err) {
            console.error('Failed to load profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.business_name.trim()) newErrors.business_name = 'İşletme adı gereklidir';
        if (!formData.city.trim()) newErrors.city = 'Şehir gereklidir';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setSubmitting(true);
        setErrors({});
        setSuccess('');

        try {
            const profileData = {
                business_name: formData.business_name,
                city: formData.city,
            };

            // Convert comma-separated services to array
            if (formData.services.trim()) {
                profileData.services = formData.services.split(',').map(s => s.trim()).filter(Boolean);
            }

            if (formData.price_range) {
                profileData.price_range = formData.price_range;
            }

            if (formData.experience_years) {
                profileData.experience_years = parseInt(formData.experience_years);
            }

            if (profile) {
                // Update existing profile
                const updated = await updateButcherProfile(profile.id, profileData);
                setProfile(updated);
                setSuccess('Profil güncellendi');
            } else {
                // Create new profile
                const newProfile = await createButcherProfile(profileData);
                setProfile(newProfile);
                setSuccess('Profil oluşturuldu');
            }

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Profile save failed:', err);
            if (err.response?.data) {
                const backendErrors = err.response.data;
                const newErrors = {};
                Object.keys(backendErrors).forEach(key => {
                    newErrors[key] = Array.isArray(backendErrors[key])
                        ? backendErrors[key][0]
                        : backendErrors[key];
                });
                setErrors(newErrors);
            } else {
                setErrors({ general: 'Profil kaydedilemedi' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="butcher-container">
                <div className="butcher-header">
                    <h1>Profil</h1>
                </div>
                <div className="page">
                    <div className="page__container">
                        <div className="loading">Yükleniyor...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="butcher-container">
            <div className="butcher-header">
                <h1>Kasap Profili</h1>
                <div className="header-actions">
                    <button onClick={() => navigate('/butcher/appointments')} className="nav-btn">
                        Randevularım
                    </button>
                    <button onClick={() => navigate('/')} className="back-btn">← Geri</button>
                </div>
            </div>

            <div className="page">
                <div className="page__container">
                    <div className="form-card">
                        {!profile && !formData.business_name && (
                            <div className="info-message">
                                <p>Henüz profil oluşturmadınız. Lütfen aşağıdaki formu doldurun.</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="business_name">İşletme Adı *</label>
                                <input
                                    type="text"
                                    id="business_name"
                                    name="business_name"
                                    value={formData.business_name}
                                    onChange={handleChange}
                                    placeholder="örn: Ahmet Kasap"
                                    required
                                />
                                {errors.business_name && <span className="error-text">{errors.business_name}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="city">Şehir *</label>
                                <input
                                    type="text"
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="örn: Ankara"
                                    required
                                />
                                {errors.city && <span className="error-text">{errors.city}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="services">Hizmetler (virgülle ayırın)</label>
                                <input
                                    type="text"
                                    id="services"
                                    name="services"
                                    value={formData.services}
                                    onChange={handleChange}
                                    placeholder="örn: Kesim, Paketleme, Nakliye"
                                />
                                <small>Birden fazla hizmet için virgül kullanın</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="experience_years">Deneyim (Yıl)</label>
                                <input
                                    type="number"
                                    id="experience_years"
                                    name="experience_years"
                                    value={formData.experience_years}
                                    onChange={handleChange}
                                    placeholder="örn: 10"
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="price_range">Fiyat Aralığı</label>
                                <input
                                    type="text"
                                    id="price_range"
                                    name="price_range"
                                    value={formData.price_range}
                                    onChange={handleChange}
                                    placeholder="örn: 500-1000 TL"
                                />
                            </div>

                            {success && <div className="success-message">{success}</div>}
                            {errors.general && <div className="error-message">{errors.general}</div>}

                            <button type="submit" className="submit-btn" disabled={submitting}>
                                {submitting ? 'Kaydediliyor...' : (profile ? 'Güncelle' : 'Profil Oluştur')}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ButcherProfile;
