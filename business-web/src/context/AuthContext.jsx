import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [requiresOnboarding, setRequiresOnboarding] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            try {
                const response = await authAPI.getProfile();
                setUser(response.data.user);
                setIsAuthenticated(true);
                setRequiresOnboarding(response.data.user.onboarding_status !== 'COMPLETED');
            } catch (error) {
                logout();
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        const response = await authAPI.login(email, password);
        const { token, user } = response.data;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        setUser(user);
        setIsAuthenticated(true);
        setRequiresOnboarding(user.onboarding_status !== 'COMPLETED');

        return user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
        setRequiresOnboarding(false);
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAuthenticated,
            requiresOnboarding,
            login,
            logout,
            checkAuth,
            updateUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};
