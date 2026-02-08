import { Express, Router } from "express";
import { adminOnly, protect } from "../../middlewares/authMiddleware";
import { createCommunity, deleteCommunity, getAllCommunities, getCommunityById, updateCommunity } from "../../controllers/community.controller";
const communityRoutes: Router = Router();
communityRoutes.post('/', protect, adminOnly, createCommunity)
communityRoutes.get('/all', protect, adminOnly, getAllCommunities)
communityRoutes.get('/:id', protect, adminOnly, getCommunityById)
communityRoutes.put('/:id', protect, adminOnly, updateCommunity)
communityRoutes.delete('/:id', protect, adminOnly, deleteCommunity)
export default communityRoutes;
