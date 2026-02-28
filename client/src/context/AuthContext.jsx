import { createContext, useState, useEffect } from "react";
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem("user");
            }
        }
    }, []);

    const login = (userData) => {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    };

    // Bug fix: was calling wrong endpoint /api/auth/me → now /api/users/me
    const refreshUser = async () => {
        try {
            const { data } = await api.get('/api/users/me');
            // Preserve existing token when refreshing user data
            const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
            const merged = { ...data, token: data.token || currentUser?.token };
            localStorage.setItem("user", JSON.stringify(merged));
            setUser(merged);
            return merged;
        } catch (error) {
            console.error("Failed to refresh user:", error);
        }
    };

    const logout = () => {
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
