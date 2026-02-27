import app from './app.js';
import dotenv from 'dotenv';
import pool from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Test DB Connection before starting the server
pool.query('SELECT NOW()')
    .then((res) => {
        console.log('PostgreSQL database connected at:', res.rows[0].now);

        // Start server only after DB is successfully verified
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to the database:', err);
        process.exit(1);
    });

    