import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const RoleProtectedRoute = ({ children, requiredRole }) => {
    const { user, roles, loading } = useAuth();

    if (loading) {
        return (
            <div className="page">
                <div className="page__container">
                    <div className="loading">Yükleniyor...</div>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && (!roles || !roles.includes(requiredRole))) {
        return (
            <div className="page">
                <div className="page__container">
                    <div className="form-card">
                        <h2>Yetkiniz Yok</h2>
                        <p>Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
                        <button onClick={() => window.location.href = '/'} className="submit-btn">
                            Ana Sayfaya Dön
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return children;
};

export default RoleProtectedRoute;
