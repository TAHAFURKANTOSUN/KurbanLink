import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createListing, uploadListingImages } from '../../api/sellers';
import './Seller.css';

const NewListing = () => {
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
    const [loading, setLoading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState([]);

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

        setLoading(true);
        setErrors({});

        try {
            // Create listing
            const listingData = {
                animal_type: formData.animal_type,
                breed: formData.breed,
                price: parseFloat(formData.price),
                location: formData.location,
            };

            if (formData.age && formData.age !== '') listingData.age = parseInt(formData.age);
            if (formData.weight && formData.weight !== '') listingData.weight = parseFloat(formData.weight);
            if (formData.description && formData.description !== '') listingData.description = formData.description;

            const newListing = await createListing(listingData);

            // Upload images if any
            if (selectedImages.length > 0) {
                setUploadStatus([{ message: 'Resimler yükleniyor...' }]);
                const results = await uploadListingImages(newListing.id, selectedImages);
                setUploadStatus(results);

                // Wait a moment to show upload results
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            navigate('/seller/listings');
        } catch (err) {
            console.error('Create listing failed:', err);
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
                setErrors({ general: 'İlan oluşturulamadı' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="seller-container">
            <div className="seller-header">
                <h1>Yeni İlan</h1>
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
                                    placeholder="örn: Merinos, Kıvırcık"
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
                                    placeholder="örn: Ankara, Çankaya"
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
                                    placeholder="İlan detayları..."
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="images">Resimler (En fazla 5)</label>
                                <input
                                    type="file"
                                    id="images"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                />
                                {selectedImages.length > 0 && (
                                    <div className="image-preview">
                                        <p>{selectedImages.length} resim seçildi</p>
                                        <ul>
                                            {selectedImages.map((file, idx) => (
                                                <li key={idx}>{file.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {uploadStatus.length > 0 && (
                                <div className="upload-status">
                                    {uploadStatus.map((status, idx) => (
                                        <div key={idx} className={status.success ? 'success' : 'error'}>
                                            {status.message || status.file}: {status.success ? '✓' : status.error}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {errors.general && <div className="error-message">{errors.general}</div>}

                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? 'Oluşturuluyor...' : 'İlan Oluştur'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewListing;
