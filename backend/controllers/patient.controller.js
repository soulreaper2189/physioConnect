import { query } from '../config/db.js';

/**
 * Toggle exercise completion status for today
 */
export const toggleExerciseCompletion = async (req, res, next) => {
    try {
        const { id } = req.params; // assigned_exercise_id
        const { completed } = req.body;
        const patient_id = req.user.id; // From auth middleware

        if (completed === undefined) {
            return res.status(400).json({ success: false, message: 'Completion status required' });
        }

        const today = new Date().toISOString().split('T')[0];

        if (completed) {
            // Mark as completed
            const insertQuery = `
                INSERT INTO exercise_completions (assigned_exercise_id, patient_id, completion_date, completed)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (assigned_exercise_id, completion_date) 
                DO UPDATE SET completed = $4;
            `;
            await query(insertQuery, [id, patient_id, today, true]);
        } else {
            // Mark as incomplete (or just delete the record for today)
            const deleteQuery = `
                DELETE FROM exercise_completions 
                WHERE assigned_exercise_id = $1 AND completion_date = $2;
            `;
            await query(deleteQuery, [id, today]);
        }

        return res.status(200).json({
            success: true,
            message: `Exercise marked as ${completed ? 'completed' : 'incomplete'}`,
            completed
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Link a patient to a doctor using the doctor's unique code
 */
export const linkDoctor = async (req, res, next) => {
    try {
        const { patient_id } = req.params;
        const { doctor_code } = req.body;

        if (!patient_id || !doctor_code) {
            return res.status(400).json({ success: false, message: 'Patient ID and Doctor Code are required' });
        }

        // Verify patient exists
        const patientCheck = await query('SELECT role FROM users WHERE id = $1', [patient_id]);
        if (patientCheck.rows.length === 0 || patientCheck.rows[0].role !== 'patient') {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        // Find doctor by code
        const doctorCheck = await query('SELECT id FROM users WHERE unique_doctor_code = $1 AND role = $2', [doctor_code, 'doctor']);
        if (doctorCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Invalid Doctor Assignment Code' });
        }

        const doctor_id = doctorCheck.rows[0].id;

        // Link patient to doctor
        await query('UPDATE users SET doctor_id = $1 WHERE id = $2', [doctor_id, patient_id]);

        return res.status(200).json({
            success: true,
            message: 'Successfully linked to doctor',
            doctor_id
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Log progress for a patient
 */
export const logProgress = async (req, res, next) => {
    try {
        const { patient_id, session_date, pain_level, mobility_notes } = req.body;

        if (!patient_id || !session_date || pain_level === undefined) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        if (pain_level < 0 || pain_level > 10) {
            return res.status(400).json({ success: false, message: 'Pain level must be between 0 and 10' });
        }

        // Verify user exists and is a patient
        const userCheck = await query('SELECT role FROM users WHERE id = $1', [patient_id]);
        if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'patient') {
            return res.status(404).json({ success: false, message: 'Patient not found or invalid role' });
        }

        const insertQuery = `
      INSERT INTO progress_logs (patient_id, session_date, pain_level, mobility_notes)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
        const result = await query(insertQuery, [patient_id, session_date, pain_level, mobility_notes || '']);

        return res.status(201).json({
            success: true,
            message: 'Progress logged successfully',
            progress: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get history of progress logs for a specific patient
 */
export const getProgressHistory = async (req, res, next) => {
    try {
        const { patient_id } = req.params;

        if (!patient_id) {
            return res.status(400).json({ success: false, message: 'Patient ID is required' });
        }

        const logsQuery = `
      SELECT id, session_date, pain_level, mobility_notes, therapist_notes, created_at
      FROM progress_logs
      WHERE patient_id = $1
      ORDER BY session_date DESC, created_at DESC;
    `;
        const result = await query(logsQuery, [patient_id]);

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            logs: result.rows
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get assigned exercises for a patient
 */
export const getAssignedExercises = async (req, res, next) => {
    try {
        const { patient_id } = req.params;

        if (!patient_id) {
            return res.status(400).json({ success: false, message: 'Patient ID is required' });
        }

        const today = new Date().toISOString().split('T')[0];

        const exercisesQuery = `
      SELECT 
        ae.id, 
        ae.exercise_name, 
        ae.assigned_date, 
        ae.created_at, 
        ae.doctor_id,
        CASE WHEN ec.id IS NOT NULL THEN true ELSE false END as is_completed_today
      FROM assigned_exercises ae
      LEFT JOIN exercise_completions ec ON ae.id = ec.assigned_exercise_id AND ec.completion_date = $2
      WHERE ae.patient_id = $1
      ORDER BY ae.created_at DESC;
    `;
        const result = await query(exercisesQuery, [patient_id, today]);

        return res.status(200).json({
            success: true,
            count: result.rows.length,
            exercises: result.rows
        });
    } catch (error) {
        next(error);
    }
};
