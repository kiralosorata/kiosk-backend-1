import { Router } from 'express';
import {
  triagePatient,
  getAllPatients,
  updatePatientStatus,
  clearPatient,
  deletePatient,
  updatePatientVitals
} from '../controllers/triageController.js';

const router = Router();

router.post('/triage', triagePatient);

router.get('/admin/patients', getAllPatients);
router.patch('/admin/patients/:id/status', updatePatientStatus);
router.patch('/admin/patients/:id/clear',  clearPatient);   // ← new
router.delete('/admin/patients/:id',        deletePatient); // ← new
router.patch('/admin/patients/:id/vitals', updatePatientVitals);   // ← new

export default router;
