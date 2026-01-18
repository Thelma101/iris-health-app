import { Express, Router } from "express";
import { adminOnly, protect, agentOrAdmin } from "../../middlewares/authMiddleware";
import { createCommunity, deleteCommunity, getAllCommunities, getCommunityById, updateCommunity } from "../../controllers/community.controller";

const communityRoutes: Router = Router();

// GET routes - accessible by both admin and field agents
communityRoutes.get('/all', protect, agentOrAdmin, getAllCommunities);
communityRoutes.get('/:id', protect, agentOrAdmin, getCommunityById);

// POST, PUT, DELETE - admin only
communityRoutes.post('/', protect, adminOnly, createCommunity);
communityRoutes.put('/:id', protect, adminOnly, updateCommunity);
communityRoutes.delete('/:id', protect, adminOnly, deleteCommunity);

export default communityRoutes;
