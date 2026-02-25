import axios from "axios";

// Use environment variable in production, fallback to localhost in development
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: API_URL,
    timeout: 60000, // 60 second timeout for face detection (cold start ~45s)
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            console.error('[API] Request timeout');
            error.message = 'Request timed out. Please try again.';
        } else if (!error.response) {
            console.error('[API] Network error');
            error.message = 'Network error. Please check your connection.';
        } else {
            console.error('[API] Error:', error.response?.status, error.response?.data);
        }
        return Promise.reject(error);
    }
);

export default api;
