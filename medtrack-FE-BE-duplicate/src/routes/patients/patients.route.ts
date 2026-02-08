import { Express, Router } from "express";
import { adminOnly, agentOrAdmin, protect } from "../../middlewares/authMiddleware";
import { createPatient, deletePatient, getAllPatients, getPatientById, updatePatient } from "../../controllers/patients.controller";
import upload from "../../middlewares/upload";
const patientRoutes: Router = Router();
patientRoutes.post('/', protect, adminOnly, upload.fields([
    { name: "testSheet", maxCount: 1 },
    { name: "patientImage", maxCount: 1 },
  ]), createPatient)
patientRoutes.get('/', protect, agentOrAdmin, getAllPatients)
patientRoutes.get('/:id', protect, agentOrAdmin, getPatientById)
patientRoutes.put('/:id', protect, agentOrAdmin, updatePatient)
patientRoutes.delete('/:id', protect, adminOnly, deletePatient)
export default patientRoutes;
