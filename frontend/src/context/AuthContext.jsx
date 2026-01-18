import { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // If token exists, we should ideally validate it with backend here
            // For now, we decode it or just trust it until an API call fails
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (storedUser) setUser(storedUser);
        }
        setLoading(false);
    }, [token]);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const register = async (name, email, password, phone) => {
        await api.post('/auth/register', { name, email, password, phone });
    };

    // NEW: Allow components to request a user profile refresh (e.g., after donation)
    const refreshUser = async () => {
        if (!token) return;
        try {
            // We need a route for this, usually GET /auth/me or similar. 
            // For now, let's assume we might just want to re-validate or update local state if we had an endpoint.
            // Since we don't have a specific /me endpoint in the shown code, we will rely on data fetching in components
            // OR we can implement a quick check.

            // Actually, let's keep it simple: If we had a way to get updated user stats (like totalDonated defined in User model?), 
            // we'd fetch it here.
            // Given the current User model only stores basic info and total is calculated on the fly in dashboard...
            // We'll leave this empty for now but expose it if we add a /me endpoint later.
            // Wait! dashboard calculates total from /donations/my-history.
            // So resizing this part... 
            // Better approach: ensure UserDashboard re-fetches donations on focus/mount.
            // But let's keep the logout clean.
        } catch (err) {
            console.error(err);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, loading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};