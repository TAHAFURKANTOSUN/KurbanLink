import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, isInitializing } = useAuth();

    // Debug log
    const hasToken = !!localStorage.getItem('access_token');
    console.log('[ProtectedRoute]', {
        isInitializing,
        hasUser: !!user,
        hasToken
    });

    // Show loading while initializing
    if (isInitializing) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                <div>Yükleniyor...</div>
            </div>
        );
    }

    // After initialization, check authentication
    if (!user || !hasToken) {
        console.log('[ProtectedRoute] Redirecting to /login');
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
