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

// ========================================
// FIELD AGENT AUTH ROUTES (Phase 2 - Field Agent Dashboard)
// ========================================
fieldAgentRoutes.post('/login', loginfieldAgent);
fieldAgentRoutes.get('/profile', protect, getfieldAgentProfile);

// ========================================
// ADMIN-ONLY ROUTES (Phase 1 - Admin Dashboard)
// Used for User Management page
// NOTE: Protection temporarily disabled for development
// TODO: Re-enable protection once admin auth flow is complete:
// fieldAgentRoutes.post('/signup', protect, adminOnly, registerfieldAgent);
// fieldAgentRoutes.get('/all', protect, adminOnly, getAllFieldAgents);
// etc.
// ========================================
fieldAgentRoutes.post('/signup', registerfieldAgent);
fieldAgentRoutes.get('/all', getAllFieldAgents);
fieldAgentRoutes.get('/:id', getFieldAgentById);
fieldAgentRoutes.put('/:id', updateFieldAgent);
fieldAgentRoutes.delete('/:id', deleteFieldAgent);

export default fieldAgentRoutes;
