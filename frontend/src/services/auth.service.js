import axios from 'axios';

// Get base URL from env or use default for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Set up axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const authService = {
    // Login method
    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.success) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
                // You might have a token if JWT is used
                if (response.data.token) {
                    localStorage.setItem('token', response.data.token);
                }
            }
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || 'Login failed');
            }
            throw new Error('Network error or server is unavailable');
        }
    },

    // Register method
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            if (error.response && error.response.data) {
                throw new Error(error.response.data.message || 'Registration failed');
            }
            throw new Error('Network error or server is unavailable');
        }
    },

    // Logout method
    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    },

    // Get current user from storage
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                return JSON.parse(userStr);
            } catch (e) {
                return null;
            }
        }
        return null;
    }
};

export default authService;
