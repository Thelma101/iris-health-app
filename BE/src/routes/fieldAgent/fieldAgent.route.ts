import { Express, Router } from "express";
import { protect } from "../../middlewares/authMiddleware";
import { getfieldAgentProfile, loginfieldAgent, registerfieldAgent } from "../../controllers/fieldAgent.controller";
const fieldAgentRoutes: Router = Router();
fieldAgentRoutes.post('/signup', registerfieldAgent)
fieldAgentRoutes.post('/login', loginfieldAgent)
fieldAgentRoutes.get('/profile', protect, getfieldAgentProfile)
export default fieldAgentRoutes;
