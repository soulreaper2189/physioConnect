import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

// JWT helper function
const generateToken = (user) => {
    // Secret ideally from environment, default fallback for dev
    const secret = process.env.JWT_SECRET || 'healthcare_hackathon_secret_123';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    return jwt.sign(
        { id: user.id, role: user.role, email: user.email },
        secret,
        { expiresIn }
    );
};

// Generate 8-character alphanumeric doctor code
const generateDoctorCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
};

/**
 * Register a new User
 */
export const register = async (req, res, next) => {
    try {
        const { first_name, last_name, email, password, role, doctor_code } = req.body;

        // Validate required fields
        if (!first_name || !last_name || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        if (role !== 'patient' && role !== 'doctor') {
            return res.status(400).json({ success: false, message: 'Invalid role specified' });
        }

        let doctor_id = null;
        if (role === 'patient' && doctor_code) {
            // Find the doctor by their unique code
            const doctorCheck = await query('SELECT id FROM users WHERE unique_doctor_code = $1 AND role = $2', [doctor_code, 'doctor']);
            if (doctorCheck.rows.length === 0) {
                return res.status(400).json({ success: false, message: 'Invalid Doctor Assignment Code.' });
            }
            doctor_id = doctorCheck.rows[0].id;
        }

        // Check if user already exists
        const userCheck = await query('SELECT id FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(409).json({ success: false, message: 'Email already in use' });
        }

        // Securely hash password
        // Using a try-catch for bcrypt to ensure no synchronous crashing happens here unnoticed
        let passwordHash;
        try {
            const saltRounds = 10;
            passwordHash = await bcrypt.hash(password, saltRounds);
        } catch (bcryptErr) {
            console.error('Bcrypt Hashing Error:', bcryptErr);
            return res.status(500).json({ success: false, message: 'Error securing password' });
        }

        // For doctors, generate a unique code
        const unique_doctor_code = role === 'doctor' ? generateDoctorCode() : null;

        // Insert user into DB
        const insertQuery = `
      INSERT INTO users (first_name, last_name, email, password_hash, role, doctor_id, unique_doctor_code)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, first_name, last_name, email, role, doctor_id, unique_doctor_code;
    `;
        const result = await query(insertQuery, [
            first_name,
            last_name,
            email,
            passwordHash,
            role,
            doctor_id,
            unique_doctor_code
        ]);

        const newUser = result.rows[0];

        // Generate Token
        const token = generateToken(newUser);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: newUser,
            token
        });
    } catch (error) {
        // Pass errors to the express global error handler
        next(error);
    }
};

/**
 * Login a User
 */
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        // Fetch user by email
        const result = await query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const user = result.rows[0];

        // Verify password against stored hash
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Remove hashed password from user object before sending response
        delete user.password_hash;

        // Generate Token
        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: user,
            token
        });
    } catch (error) {
        next(error);
    }
};
