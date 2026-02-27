import axios from 'axios';
import authService from './auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create an axios instance that automatically attaches the token/user auth
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor for JWT
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const doctorService = {
    getPatients: async (doctorId) => {
        try {
            const response = await api.get(`/doctor/patients?doctor_id=${doctorId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getPatientProgress: async (doctorId, patientId) => {
        try {
            const response = await api.get(`/doctor/patients/${patientId}/progress?doctor_id=${doctorId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    assignExercise: async (doctorId, patientId, exerciseName) => {
        try {
            const response = await api.post(`/doctor/patients/${patientId}/exercises?doctor_id=${doctorId}`, {
                exercise_name: exerciseName
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    removeExercise: async (doctorId, patientId, exerciseId) => {
        try {
            const response = await api.delete(`/doctor/patients/${patientId}/exercises/${exerciseId}?doctor_id=${doctorId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export const patientService = {
    linkDoctor: async (patientId, doctorCode) => {
        try {
            const response = await api.post(`/patient/${patientId}/link-doctor`, { doctor_code: doctorCode });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    toggleExerciseCompletion: async (exerciseId, completed) => {
        try {
            const response = await api.post(`/patient/exercises/${exerciseId}/complete`, { completed });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    logProgress: async (progressData) => {
        try {
            const response = await api.post('/patient/progress', progressData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getProgressHistory: async (patientId) => {
        try {
            const response = await api.get(`/patient/${patientId}/progress`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getAssignedExercises: async (patientId) => {
        try {
            const response = await api.get(`/patient/${patientId}/exercises`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
