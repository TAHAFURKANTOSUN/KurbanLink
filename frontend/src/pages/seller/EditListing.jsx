import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchListingDetails, updateListing, uploadListingImages } from '../../api/sellers';
import './Seller.css';

const EditListing = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        animal_type: 'KUCUKBAS',
        breed: '',
        age: '',
        weight: '',
        price: '',
        location: '',
        description: ''
    });
    const [selectedImages, setSelectedImages] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadListing = async () => {
            try {
                const listing = await fetchListingDetails(id);
                setFormData({
                    animal_type: listing.animal_type || 'KUCUKBAS',
                    breed: listing.breed || '',
                    age: listing.age || '',
                    weight: listing.weight || '',
                    price: listing.price || '',
                    location: listing.location || '',
                    description: listing.description || ''
                });
            } catch (err) {
                console.error('Failed to load listing:', err);
                alert('İlan yüklenemedi');
                navigate('/seller/listings');
            } finally {
                setLoading(false);
            }
        };

        loadListing();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            alert('En fazla 5 resim yükleyebilirsiniz');
            return;
        }
        setSelectedImages(files);
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.breed.trim()) newErrors.breed = 'Cins gereklidir';
        if (!formData.price) newErrors.price = 'Fiyat gereklidir';
        if (formData.price && isNaN(formData.price)) newErrors.price = 'Geçerli bir fiyat girin';
        if (!formData.location.trim()) newErrors.location = 'Konum gereklidir';
        if (formData.age && isNaN(formData.age)) newErrors.age = 'Geçerli bir yaş girin';
        if (formData.weight && isNaN(formData.weight)) newErrors.weight = 'Geçerli bir ağırlık girin';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setSubmitting(true);
        setErrors({});

        try {
            const listingData = {
                animal_type: formData.animal_type,
                breed: formData.breed,
                price: parseFloat(formData.price),
                location: formData.location,
            };

            if (formData.age) listingData.age = parseInt(formData.age);
            if (formData.weight) listingData.weight = parseFloat(formData.weight);
            if (formData.description) listingData.description = formData.description;

            await updateListing(id, listingData);

            // Upload new images if any
            if (selectedImages.length > 0) {
                await uploadListingImages(id, selectedImages);
            }

            navigate('/seller/listings');
        } catch (err) {
            console.error('Update listing failed:', err);
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
                setErrors({ general: 'İlan güncellenemedi' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="seller-container">
                <div className="seller-header">
                    <h1>İlan Düzenle</h1>
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
        <div className="seller-container">
            <div className="seller-header">
                <h1>İlan Düzenle</h1>
                <div className="header-actions">
                    <button onClick={() => navigate('/seller/listings')} className="back-btn">
                        ← Geri
                    </button>
                </div>
            </div>

            <div className="page">
                <div className="page__container">
                    <div className="form-card">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="animal_type">Hayvan Türü *</label>
                                <select
                                    id="animal_type"
                                    name="animal_type"
                                    value={formData.animal_type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="KUCUKBAS">Küçükbaş</option>
                                    <option value="BUYUKBAS">Büyükbaş</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="breed">Cins *</label>
                                <input
                                    type="text"
                                    id="breed"
                                    name="breed"
                                    value={formData.breed}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.breed && <span className="error-text">{errors.breed}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="age">Yaş (ay)</label>
                                    <input
                                        type="number"
                                        id="age"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        min="0"
                                    />
                                    {errors.age && <span className="error-text">{errors.age}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="weight">Ağırlık (kg)</label>
                                    <input
                                        type="number"
                                        id="weight"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                    />
                                    {errors.weight && <span className="error-text">{errors.weight}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="price">Fiyat (TL) *</label>
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                                {errors.price && <span className="error-text">{errors.price}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="location">Konum *</label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.location && <span className="error-text">{errors.location}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Açıklama</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="images">Yeni Resimler Ekle (Opsiyonel)</label>
                                <input
                                    type="file"
                                    id="images"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                />
                                {selectedImages.length > 0 && (
                                    <div className="image-preview">
                                        <p>{selectedImages.length} yeni resim seçildi</p>
                                    </div>
                                )}
                            </div>

                            {errors.general && <div className="error-message">{errors.general}</div>}

                            <button type="submit" className="submit-btn" disabled={submitting}>
                                {submitting ? 'Güncelleniyor...' : 'Güncelle'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditListing;
