import { Express, Router, Request, Response } from "express";
import AdminRoutes from "./admin/admin.route";
import fieldAgentRoutes from "./fieldAgent/fieldAgent.route";
import communityRoutes from "./community/community.route";
import patientRoutes from "./patients/patients.route";
import visitationRoutes from "./visitation/visitation.route";
import inventoryRoutes from "./inventory/inventory.route";

const rootRoutes: Router = Router();

rootRoutes.use('/admin', AdminRoutes);
rootRoutes.use('/fieldAgent', fieldAgentRoutes);
rootRoutes.use('/community', communityRoutes);
rootRoutes.use('/patients', patientRoutes);
rootRoutes.use('/visitation', visitationRoutes);
rootRoutes.use('/inventory', inventoryRoutes);
export default rootRoutes;
