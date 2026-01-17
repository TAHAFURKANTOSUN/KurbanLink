import { createContext, useContext, useState, useEffect } from 'react';
import { loginAPI, registerAPI } from '../api/auth';
import { getRolesFromToken, getUserIdFromToken } from '../utils/jwt';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);

    // Initialize auth state from localStorage on mount
    useEffect(() => {
        const initAuth = () => {
            try {
                const token = localStorage.getItem('access_token');

                // Debug log
                console.log('[AuthContext] Initializing:', {
                    hasToken: !!token,
                    tokenLength: token?.length || 0
                });

                if (token) {
                    // Extract user info from token
                    const userId = getUserIdFromToken(token);
                    const userRoles = getRolesFromToken(token);

                    console.log('[AuthContext] Token found:', {
                        userId,
                        roles: userRoles
                    });

                    setUser({ id: userId });
                    setRoles(userRoles || []);
                } else {
                    console.log('[AuthContext] No token found');
                    setUser(null);
                    setRoles([]);
                }
            } catch (err) {
                console.error('[AuthContext] Init error:', err);
                setUser(null);
                setRoles([]);
            } finally {
                setIsInitializing(false);
            }
        };

        initAuth();
    }, []);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);

        try {
            const data = await loginAPI(email, password);
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);

            const userId = getUserIdFromToken(data.access);
            const userRoles = getRolesFromToken(data.access);

            setUser({ id: userId, email });
            setRoles(userRoles || []);

            console.log('[AuthContext] Login success:', {
                userId,
                roles: userRoles
            });

            return true;
        } catch (err) {
            const errorMsg = err.response?.data?.detail || 'Login failed';
            setError(errorMsg);
            console.error('[AuthContext] Login failed:', err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        setError(null);

        try {
            const data = await registerAPI(userData);
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);

            const userId = getUserIdFromToken(data.access);
            const userRoles = getRolesFromToken(data.access);

            setUser({ id: userId, email: userData.email });
            setRoles(userRoles || []);

            console.log('[AuthContext] Register success:', {
                userId,
                roles: userRoles
            });

            return { success: true };
        } catch (err) {
            const errors = err.response?.data || {};
            console.error('[AuthContext] Register failed:', err);
            return { success: false, errors };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
        setRoles([]);
        console.log('[AuthContext] Logout');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                roles,
                loading,
                error,
                isInitializing,
                login,
                register,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
