import { Express, Router } from "express";
import { getAdminProfile, loginAdmin, registerAdmin } from "../../controllers/admin.controller";
import { protect } from "../../middlewares/authMiddleware";
const AdminRoutes: Router = Router();
AdminRoutes.post('/signup', registerAdmin)
AdminRoutes.post('/login', loginAdmin)
AdminRoutes.get('/profile', protect, getAdminProfile)
export default AdminRoutes;
