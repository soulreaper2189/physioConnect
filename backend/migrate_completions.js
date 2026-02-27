import { query } from './config/db.js';

async function migrate() {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS exercise_completions (
                id SERIAL PRIMARY KEY,
                assigned_exercise_id INTEGER REFERENCES assigned_exercises(id) ON DELETE CASCADE,
                patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
                completed BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(assigned_exercise_id, completion_date)
            );
        `);
        console.log('Migration successful: created exercise_completions table');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

migrate();
