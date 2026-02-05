import { Express, Router } from "express";
import { getAdminProfile, getAllAdmins, loginAdmin, registerAdmin, updateAdmin, updateAdminProfile, deleteAdmin } from "../../controllers/admin.controller";
import { protect, adminOnly } from "../../middlewares/authMiddleware";
const AdminRoutes: Router = Router();
AdminRoutes.post('/signup', registerAdmin)
AdminRoutes.post('/login', loginAdmin)
AdminRoutes.get('/profile', protect, getAdminProfile)
AdminRoutes.patch('/update', protect, updateAdminProfile)  // Self-update for logged-in admin
AdminRoutes.get('/admins', protect, adminOnly, getAllAdmins)
AdminRoutes.put('/:id', protect, adminOnly, updateAdmin)   // Update any admin by ID
AdminRoutes.patch('/:id', protect, adminOnly, updateAdmin) // Update any admin by ID
AdminRoutes.delete('/:id', protect, adminOnly, deleteAdmin)
export default AdminRoutes;
