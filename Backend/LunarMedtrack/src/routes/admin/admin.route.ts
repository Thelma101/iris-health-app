import { Express, Router } from "express";
import { getAdminProfile, getAllAdmins, getAdminById, updateAdmin, deleteAdmin, getCasesPerCommunity, getDashboardStats, getTestResultsSummary, loginAdmin, registerAdmin } from "../../controllers/admin.controller";
import { adminOnly, protect } from "../../middlewares/authMiddleware";
const AdminRoutes: Router = Router();
AdminRoutes.post('/signup', registerAdmin)
AdminRoutes.post('/login', loginAdmin)
AdminRoutes.get('/profile', protect, getAdminProfile)
AdminRoutes.get('/all', protect, adminOnly, getAllAdmins)
AdminRoutes.get('/:id', protect, adminOnly, getAdminById)
AdminRoutes.put('/:id', protect, adminOnly, updateAdmin)
AdminRoutes.delete('/:id', protect, adminOnly, deleteAdmin)
AdminRoutes.get('/analytics/cases-per-community', protect, getCasesPerCommunity)
AdminRoutes.get('/analytics/test-results', protect, getTestResultsSummary)
AdminRoutes.get('/analytics/dashboard-stats', protect, getDashboardStats)
export default AdminRoutes;
