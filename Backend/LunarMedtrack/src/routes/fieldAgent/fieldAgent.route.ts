import { Express, Router } from "express";
import { protect, adminOnly } from "../../middlewares/authMiddleware";
import { 
  getfieldAgentProfile, 
  loginfieldAgent, 
  registerfieldAgent,
  getAllFieldAgents,
  getFieldAgentById,
  updateFieldAgent,
  deleteFieldAgent
} from "../../controllers/fieldAgent.controller";

const fieldAgentRoutes: Router = Router();

fieldAgentRoutes.post('/login', loginfieldAgent);
fieldAgentRoutes.get('/profile', protect, getfieldAgentProfile);
fieldAgentRoutes.post('/signup', registerfieldAgent);
fieldAgentRoutes.get('/all', getAllFieldAgents);
fieldAgentRoutes.get('/:id', getFieldAgentById);
fieldAgentRoutes.put('/:id', updateFieldAgent);
fieldAgentRoutes.delete('/:id', deleteFieldAgent);

export default fieldAgentRoutes;
