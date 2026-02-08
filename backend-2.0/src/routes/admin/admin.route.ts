import { Express, Router } from "express";
import { getAdminProfile, getAllAdmins, loginAdmin, registerAdmin, updateAdminProfile, updateAdmin, deleteAdmin } from "../../controllers/admin.controller";
import { adminOnly, protect } from "../../middlewares/authMiddleware";
import { filterPatients } from "../../controllers/patients.controller";
import { createTestType, getAllowedResultsById, getAllTestTypes, updateTestType, deleteTestType } from "../../controllers/testType.controller";
import { getCommunityLga } from "../../controllers/community.controller";
const AdminRoutes: Router = Router();
AdminRoutes.post('/signup', registerAdmin)
AdminRoutes.post('/login', loginAdmin)
AdminRoutes.get('/profile', protect, getAdminProfile)
AdminRoutes.patch('/update', protect, adminOnly, updateAdminProfile)
AdminRoutes.get('/admins', protect, adminOnly, getAllAdmins)
AdminRoutes.put('/:id', protect, adminOnly, updateAdmin)    // Update any admin by ID
AdminRoutes.patch('/:id', protect, adminOnly, updateAdmin)  // Update any admin by ID (PATCH)
AdminRoutes.delete('/:id', protect, adminOnly, deleteAdmin) // Delete admin by ID
AdminRoutes.get("/filter/patients", protect, adminOnly, filterPatients);
AdminRoutes.post("/testtypes", protect, adminOnly, createTestType);
AdminRoutes.get("/testtypes", protect, adminOnly, getAllTestTypes);
AdminRoutes.get("/testtypes/allowed/:id", protect, adminOnly, getAllowedResultsById);
AdminRoutes.put("/testtypes/:id", protect, adminOnly, updateTestType);
AdminRoutes.delete("/testtypes/:id", protect, adminOnly, deleteTestType);

AdminRoutes.get("/:communityId/lga", protect, adminOnly, getCommunityLga);



export default AdminRoutes;
