import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import patientRoutes from './routes/patient.routes.js';
import doctorRoutes from './routes/doctor.routes.js';

dotenv.config();

const app = express();

// Middleware
// Using cors() without passing options allows all origins - good for hackathon models
// Prevents "failed to fetch" errors.
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);

// General health check route
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

// Global Error Handler Middleware
// Captures synchronous errors from routes and provides clean JSON responses
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message // sending error message for easier debugging
    });
});

export default app;
