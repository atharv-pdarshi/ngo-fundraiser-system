import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api', // This points to your Node.js Server
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor to handle global errors like Session Expiry
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect to login if not already there
            if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;