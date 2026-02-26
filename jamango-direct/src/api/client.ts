import axios from 'axios';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

// Add a request interceptor to attach the token
client.interceptors.request.use(
    (config) => {
        const activeRole = sessionStorage.getItem('active_role');
        let activeToken = null;

        if (activeRole === 'admin') {
            activeToken = localStorage.getItem('adminToken');
        } else if (activeRole === 'staff') {
            activeToken = localStorage.getItem('staffToken');
        } else if (activeRole === 'stall') {
            activeToken = localStorage.getItem('stallToken');
        } else if (activeRole === 'customer') {
            activeToken = localStorage.getItem('token');
        }

        // If no active role yet (like on first load before initialization finishes), 
        // fallback heuristically to whichever token actually exists in local storage
        if (!activeToken) {
            activeToken = localStorage.getItem('adminToken') ||
                localStorage.getItem('staffToken') ||
                localStorage.getItem('stallToken') ||
                localStorage.getItem('token');
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
