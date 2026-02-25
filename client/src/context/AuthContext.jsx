import { createContext, useState, useEffect } from "react";
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = (userData) => {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    };

    const refreshUser = async () => {
        try {
            const { data } = await api.get('/api/auth/me'); // Ensure api is available or use fetch
            localStorage.setItem("user", JSON.stringify(data));
            setUser(data);
            return data;
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
