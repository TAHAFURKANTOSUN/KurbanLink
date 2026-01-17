import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isInitializing } = useAuth();

    console.log('[ProtectedRoute]', {
        isInitializing,
        isAuthenticated
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
    if (!isAuthenticated) {
        console.log('[ProtectedRoute] Redirecting to /login');
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
