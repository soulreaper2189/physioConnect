import express from 'express';
import { getPatientsList, getPatientProgress, assignExercise, removeExercise } from '../controllers/doctor.controller.js';
import { verifyToken, isDoctor } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/doctor/patients?doctor_id=123
router.get('/patients', verifyToken, isDoctor, getPatientsList);

// GET /api/doctor/patients/:patient_id/progress?doctor_id=123
router.get('/patients/:patient_id/progress', verifyToken, isDoctor, getPatientProgress);

// POST /api/doctor/patients/:patient_id/exercises?doctor_id=123
router.post('/patients/:patient_id/exercises', verifyToken, isDoctor, assignExercise);

// DELETE /api/doctor/patients/:patient_id/exercises/:exercise_id?doctor_id=123
router.delete('/patients/:patient_id/exercises/:exercise_id', verifyToken, isDoctor, removeExercise);

export default router;
