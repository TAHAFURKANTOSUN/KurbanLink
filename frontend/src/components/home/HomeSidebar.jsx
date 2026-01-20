import React from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { cities } from '../../data/locations';
import './HomeSidebar.css';
import { Search, PartnershipIcon } from '../../ui/icons';

const HomeSidebar = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Get current filter values
    const currentType = searchParams.get('animal_type');
    const currentGender = searchParams.get('gender');
    const currentCity = searchParams.get('city');
    const currentDate = searchParams.get('date_posted');

    const handleFilterChange = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(key, value);
        } else {
            newParams.delete(key);
        }
        setSearchParams(newParams);
    };

    const handleCategoryClick = (type) => {
        handleFilterChange('animal_type', type);
    };

    const handleProtectedLink = (e, path) => {
        e.preventDefault();
        if (!user) {
            alert('Bu işlem için giriş yapmalısınız.');
            navigate(`/login?next=${encodeURIComponent(path)}`);
        } else {
            navigate(path);
        }
    };

    return (
        <aside className="home-sidebar">
            {/* 1. Kategoriler */}
            <div className="sidebar-section">
                <h3 className="sidebar-title">Kategoriler</h3>
                <ul className="sidebar-list">
                    <li>
                        <button
                            className={`sidebar-link ${!currentType ? 'active' : ''}`}
                            onClick={() => handleCategoryClick(null)}
                        >
                            Tüm İlanlar
                        </button>
                    </li>
                    <li>
                        <button
                            className={`sidebar-link ${currentType === 'KUCUKBAS' ? 'active' : ''}`}
                            onClick={() => handleCategoryClick('KUCUKBAS')}
                        >
                            Küçükbaş
                        </button>
                    </li>
                    <li>
                        <button
                            className={`sidebar-link ${currentType === 'BUYUKBAS' ? 'active' : ''}`}
                            onClick={() => handleCategoryClick('BUYUKBAS')}
                        >
                            Büyükbaş
                        </button>
                    </li>
                </ul>
            </div>

            {/* 2. Filtreler */}
            <div className="sidebar-section">
                <h3 className="sidebar-title">Filtreler</h3>

                {/* Cinsiyet */}
                <div className="filter-group">
                    <label className="filter-label">Cinsiyet</label>
                    <div className="radio-group">
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="gender"
                                checked={!currentGender}
                                onChange={() => handleFilterChange('gender', null)}
                            /> Hepsi
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="gender"
                                value="ERKEK"
                                checked={currentGender === 'ERKEK'}
                                onChange={() => handleFilterChange('gender', 'ERKEK')}
                            /> Erkek
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="gender"
                                value="DISI"
                                checked={currentGender === 'DISI'}
                                onChange={() => handleFilterChange('gender', 'DISI')}
                            /> Dişi
                        </label>
                    </div>
                </div>

                {/* Şehir */}
                <div className="filter-group">
                    <label className="filter-label">Şehir</label>
                    <select
                        className="filter-select"
                        value={currentCity || ''}
                        onChange={(e) => handleFilterChange('city', e.target.value)}
                    >
                        <option value="">Tüm Şehirler</option>
                        {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>

                {/* Eklenme Tarihi */}
                <div className="filter-group">
                    <label className="filter-label">Eklenme Tarihi</label>
                    <div className="radio-group">
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="date"
                                checked={!currentDate}
                                onChange={() => handleFilterChange('date_posted', null)}
                            /> Tüm Zamanlar
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="date"
                                value="today"
                                checked={currentDate === 'today'}
                                onChange={() => handleFilterChange('date_posted', 'today')}
                            /> Bugün
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="date"
                                value="week"
                                checked={currentDate === 'week'}
                                onChange={() => handleFilterChange('date_posted', 'week')}
                            /> Son 7 Gün
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="date"
                                value="month"
                                checked={currentDate === 'month'}
                                onChange={() => handleFilterChange('date_posted', 'month')}
                            /> Bu Ay
                        </label>
                    </div>
                </div>
            </div>

            {/* 3. Hızlı Erişim */}
            <div className="sidebar-section">
                <h3 className="sidebar-title">Hızlı Erişim</h3>
                <ul className="sidebar-list">
                    <li>
                        <Link to="/search" className="sidebar-link">
                            <Search size={16} style={{ marginRight: '0.5rem' }} />
                            Detaylı Arama
                        </Link>
                    </li>
                    <li>
                        <a
                            href="/partnerships"
                            className="sidebar-link partnership-link"
                            onClick={(e) => handleProtectedLink(e, '/partnerships')}
                        >
                            <PartnershipIcon size={16} style={{ marginRight: '0.5rem' }} />
                            Kurban Ortaklığı
                        </a>
                    </li>
                </ul>
            </div>
        </aside>
    );
};

export default HomeSidebar;
