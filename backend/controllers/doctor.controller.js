import { query } from '../config/db.js';

/**
 * Get all patients associated with doctors (or just all patients for MVP)
 */
export const getPatientsList = async (req, res, next) => {
    try {
        const { doctor_id } = req.query;

        if (!doctor_id) {
            return res.status(400).json({ success: false, message: 'Doctor ID is required' });
        }

        // Verify user is a doctor
        const userCheck = await query('SELECT role FROM users WHERE id = $1', [doctor_id]);
        if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'doctor') {
            return res.status(403).json({ success: false, message: 'Unauthorized: Doctors only' });
        }

        const patientsQuery = `
      SELECT id, first_name, last_name, email, created_at
      FROM users
      WHERE role = 'patient' AND doctor_id = $1
      ORDER BY last_name ASC;
    `;
        const result = await query(patientsQuery, [doctor_id]);

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            patients: result.rows
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get progress history for a specific patient (used by doctor)
 */
export const getPatientProgress = async (req, res, next) => {
    try {
        const { doctor_id } = req.query;
        const { patient_id } = req.params;

        if (!doctor_id) {
            return res.status(400).json({ success: false, message: 'Doctor ID is required' });
        }

        // Verify user is a doctor
        const userCheck = await query('SELECT role FROM users WHERE id = $1', [doctor_id]);
        if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'doctor') {
            return res.status(403).json({ success: false, message: 'Unauthorized: Doctors only' });
        }

        const logsQuery = `
      SELECT id, session_date, pain_level, mobility_notes, therapist_notes, created_at
      FROM progress_logs
      WHERE patient_id = $1
      ORDER BY session_date DESC, created_at DESC;
    `;
        const result = await query(logsQuery, [patient_id]);

        const exercisesQuery = `
      SELECT id, exercise_name, assigned_date, created_at
      FROM assigned_exercises
      WHERE patient_id = $1
      ORDER BY created_at DESC;
    `;
        const exercisesResult = await query(exercisesQuery, [patient_id]);

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            progress: result.rows,
            assigned_exercises: exercisesResult.rows
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Assign an exercise to a patient
 */
export const assignExercise = async (req, res, next) => {
    try {
        const { doctor_id } = req.query;
        const { patient_id } = req.params;
        const { exercise_name } = req.body;

        if (!doctor_id) {
            return res.status(400).json({ success: false, message: 'Doctor ID is required' });
        }

        if (!exercise_name) {
            return res.status(400).json({ success: false, message: 'Exercise name is required' });
        }

        // Verify user is a doctor
        const userCheck = await query('SELECT role FROM users WHERE id = $1', [doctor_id]);
        if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'doctor') {
            return res.status(403).json({ success: false, message: 'Unauthorized: Doctors only' });
        }

        const insertQuery = `
      INSERT INTO assigned_exercises (patient_id, doctor_id, exercise_name)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
        const result = await query(insertQuery, [patient_id, doctor_id, exercise_name]);

        return res.status(201).json({
            success: true,
            message: 'Exercise assigned successfully',
            exercise: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Remove an assigned exercise from a patient
 */
export const removeExercise = async (req, res, next) => {
    try {
        const { doctor_id } = req.query;
        const { patient_id, exercise_id } = req.params;

        if (!doctor_id) {
            return res.status(400).json({ success: false, message: 'Doctor ID is required' });
        }

        // Verify user is a doctor
        const userCheck = await query('SELECT role FROM users WHERE id = $1', [doctor_id]);
        if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'doctor') {
            return res.status(403).json({ success: false, message: 'Unauthorized: Doctors only' });
        }

        const deleteQuery = `
            DELETE FROM assigned_exercises 
            WHERE id = $1 AND patient_id = $2 AND doctor_id = $3
            RETURNING id;
        `;
        const result = await query(deleteQuery, [exercise_id, patient_id, doctor_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Exercise not found or unauthorized to delete' });
        }

        return res.status(200).json({
            success: true,
            message: 'Exercise removed successfully',
            deleted_id: result.rows[0].id
        });
    } catch (error) {
        next(error);
    }
};
