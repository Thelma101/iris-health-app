import { Express, Router, Request, Response } from "express";
import AdminRoutes from "./admin/admin.route";
import fieldAgentRoutes from "./fieldAgent/fieldAgent.route";
import communityRoutes from "./community/community.route";
import patientRoutes from "./patients/patients.route";
import visitationRoutes from "./visitation/visitation.route";
import inventoryRoutes from "./inventory/inventory.route";
import { getCasesPerCommunity, getDashboardStats, getTestResultsSummary } from "../controllers/admin.controller";
import { protect } from "../middlewares/authMiddleware";

const rootRoutes: Router = Router();

rootRoutes.use('/admin', AdminRoutes);
rootRoutes.use('/fieldAgent', fieldAgentRoutes);
rootRoutes.use('/community', communityRoutes);
rootRoutes.use('/patients', patientRoutes);
rootRoutes.use('/visitation', visitationRoutes);
rootRoutes.use('/inventory', inventoryRoutes);

// Analytics routes (accessible via /api/analytics/*)
rootRoutes.get('/analytics/cases-per-community', protect, getCasesPerCommunity);
rootRoutes.get('/analytics/test-results', protect, getTestResultsSummary);
rootRoutes.get('/analytics/dashboard-stats', protect, getDashboardStats);

export default rootRoutes;
