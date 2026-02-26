import axios from 'axios';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

// Add a request interceptor to attach the token
client.interceptors.request.use(
    (config) => {
        const isAdminRoute = window.location.pathname.startsWith('/admin');
        const token = localStorage.getItem('token');
        const adminToken = localStorage.getItem('adminToken');

        // If we are on an admin route, prioritize the adminToken (which could be the impersonated token)
        // If no adminToken exists, fallback to standard token
        let activeToken = token;
        if (isAdminRoute && adminToken) {
            activeToken = adminToken;
        }

        if (activeToken) {
            config.headers.Authorization = `Bearer ${activeToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default client;
