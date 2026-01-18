import { Express, Router } from "express";
import { agentOrAdmin, protect } from "../../middlewares/authMiddleware";
import { createVisitation, deleteVisitation, getAllVisitations, getVisitationsByCommunity, getVisitationsByPatient } from "../../controllers/visitation.controller";
const visitationRoutes: Router = Router();
visitationRoutes.post('/', protect, agentOrAdmin, createVisitation)
visitationRoutes.get('/', protect, agentOrAdmin, getAllVisitations)
visitationRoutes.get('/:patientId', protect, agentOrAdmin, getVisitationsByPatient)
visitationRoutes.get('/com/:communityId', protect, agentOrAdmin, getVisitationsByCommunity)
visitationRoutes.delete('/:id', protect, agentOrAdmin, deleteVisitation)
export default visitationRoutes;


