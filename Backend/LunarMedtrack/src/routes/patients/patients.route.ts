import { Express, Router } from "express";
import { agentOrAdmin, protect } from "../../middlewares/authMiddleware";
import { createPatient, deletePatient, getAllPatients, getPatientById, updatePatient } from "../../controllers/patients.controller";
const patientRoutes: Router = Router();
patientRoutes.post('/', protect, agentOrAdmin, createPatient)
patientRoutes.get('/', protect, agentOrAdmin, getAllPatients)
patientRoutes.get('/:id', protect, agentOrAdmin, getPatientById)
patientRoutes.put('/:id', protect, agentOrAdmin, updatePatient)
patientRoutes.delete('/:id', protect, agentOrAdmin, deletePatient)
export default patientRoutes;
