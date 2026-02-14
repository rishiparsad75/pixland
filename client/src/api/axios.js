import axios from "axios";

const api = axios.create({
    baseURL: "http://192.168.29.134:5000",
});

api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

export default api;
