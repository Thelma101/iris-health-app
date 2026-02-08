import { Express, Router } from "express";
import { agentOrAdmin, protect } from "../../middlewares/authMiddleware";
import { createPatient, deletePatient, getAllPatients, getPatientById, updatePatient } from "../../controllers/patients.controller";
import { createInventoryItem, deleteInventoryItem, getAllInventoryItems, getInventoryItemById, updateInventoryItem } from "../../controllers/inventory.controller";
const inventoryRoutes: Router = Router();
inventoryRoutes.post('/', protect, agentOrAdmin, createInventoryItem)
inventoryRoutes.get('/', protect, agentOrAdmin, getAllInventoryItems)
inventoryRoutes.get('/:id', protect, agentOrAdmin, getInventoryItemById)
inventoryRoutes.put('/:id', protect, agentOrAdmin, updateInventoryItem)
inventoryRoutes.delete('/:id', protect, agentOrAdmin, deleteInventoryItem)
export default inventoryRoutes;
