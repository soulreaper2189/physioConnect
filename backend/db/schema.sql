-- Run this to initialize your database
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('patient', 'doctor')),
  doctor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  unique_doctor_code VARCHAR(8) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS progress_logs (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
  mobility_notes TEXT,
  therapist_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assigned_exercises (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  doctor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  exercise_name VARCHAR(255) NOT NULL,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
