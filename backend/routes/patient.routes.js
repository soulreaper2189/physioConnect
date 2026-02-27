import express from 'express';
import { logProgress, getProgressHistory, getAssignedExercises, linkDoctor, toggleExerciseCompletion } from '../controllers/patient.controller.js';
import { verifyToken, isPatient } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/:patient_id/link-doctor', verifyToken, isPatient, linkDoctor);
router.post('/progress', verifyToken, isPatient, logProgress);
router.get('/:patient_id/progress', verifyToken, isPatient, getProgressHistory);
router.get('/:patient_id/exercises', verifyToken, isPatient, getAssignedExercises);
router.post('/exercises/:id/complete', verifyToken, isPatient, toggleExerciseCompletion);

export default router;
