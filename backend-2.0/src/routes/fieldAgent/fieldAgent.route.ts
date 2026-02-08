import { Express, Router } from "express";
import { adminOnly, agentOrAdmin, fieldAgentOnly, protect } from "../../middlewares/authMiddleware";
import { deleteFieldAgent, getAllFieldAgents, getFieldAgentById, getfieldAgentProfile, getFieldOfficerSummary,  loginfieldAgent, registerfieldAgent, updateFieldAgent } from "../../controllers/fieldAgent.controller";
import { createPatient, filterPatients } from "../../controllers/patients.controller";
import upload from "../../middlewares/upload";
import { getAllCommunities } from "../../controllers/community.controller";
import { getAllTestTypes } from "../../controllers/testType.controller";
const fieldAgentRoutes: Router = Router();
fieldAgentRoutes.post('/signup', registerfieldAgent)
fieldAgentRoutes.post('/login', loginfieldAgent)
fieldAgentRoutes.get('/profile', protect, getfieldAgentProfile)
fieldAgentRoutes.post('/create', protect, fieldAgentOnly, upload.fields([
    { name: "testSheet", maxCount: 1 },
    { name: "patientImage", maxCount: 1 },
  ]), createPatient)
fieldAgentRoutes.get('/communities', protect, fieldAgentOnly, getAllCommunities)
fieldAgentRoutes.get('/testtypes', protect, agentOrAdmin, getAllTestTypes)

fieldAgentRoutes.get("/", protect, adminOnly, getAllFieldAgents);
fieldAgentRoutes.get("/getFieldOfficersStats", protect, agentOrAdmin, getFieldOfficerSummary);
fieldAgentRoutes.get("/:id", protect, adminOnly, getFieldAgentById);
fieldAgentRoutes.put("/:id", protect, adminOnly, updateFieldAgent);
fieldAgentRoutes.delete("/:id", protect, adminOnly, deleteFieldAgent);
fieldAgentRoutes.get("/filter/patients", protect, fieldAgentOnly, filterPatients);

export default fieldAgentRoutes;
