import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'healthcare_hackathon_secret_123';

/**
 * Middleware to verify a standard JWT token from the Authorization header
 */
export const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No valid token provided.'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach user info to request
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Token has expired.' });
        }
        return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
};

/**
 * Middleware to ensure the user is a doctor
 */
export const isDoctor = (req, res, next) => {
    if (!req.user || req.user.role !== 'doctor') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Doctor access required.'
        });
    }
    next();
};

/**
 * Middleware to ensure the user is a patient
 */
export const isPatient = (req, res, next) => {
    if (!req.user || req.user.role !== 'patient') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Patient access required.'
        });
    }
    next();
};
