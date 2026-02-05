import { Router } from "express";
import { agentOrAdmin, protect } from "../../middlewares/authMiddleware";
import {
  createTestType,
  getAllTestTypes,
  getTestTypeById,
  updateTestType,
  deleteTestType,
  seedTestTypes,
} from "../../controllers/testType.controller";

const testTypeRoutes: Router = Router();

// Public route for fetching test types (needed for forms)
testTypeRoutes.get("/", protect, getAllTestTypes);
testTypeRoutes.get("/:id", protect, getTestTypeById);

// Admin only routes
testTypeRoutes.post("/", protect, agentOrAdmin, createTestType);
testTypeRoutes.put("/:id", protect, agentOrAdmin, updateTestType);
testTypeRoutes.delete("/:id", protect, agentOrAdmin, deleteTestType);

// Seed route (for initial setup)
testTypeRoutes.post("/seed", protect, agentOrAdmin, seedTestTypes);

export default testTypeRoutes;
