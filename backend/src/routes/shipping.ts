import { Router } from 'express';
import { 
  getAllShippingRoutes,
  getShippingRouteById,
  createShippingRoute,
  updateShippingRoute,
  deleteShippingRoute,
  getShippingRouteStats,
  getShippingRoutes, 
  calculateTransitTime, 
  getRequiredDocuments, 
  generateDocument, 
  checkRestrictions, 
  validateRoute 
} from '../controllers/shippingController';
import { validateTransitCalculation } from '../middleware/validation';

const router = Router();

// CRUD operations for shipping routes
router.get('/routes', getAllShippingRoutes);                    // Get all shipping routes with filtering/pagination
router.get('/routes/stats', getShippingRouteStats);             // Get shipping route statistics
router.get('/routes/:id', getShippingRouteById);                // Get single shipping route by ID
router.post('/routes', createShippingRoute);                    // Create new shipping route
router.put('/routes/:id', updateShippingRoute);                 // Update existing shipping route
router.delete('/routes/:id', deleteShippingRoute);              // Delete shipping route

// Legacy endpoints (for backward compatibility)
router.get('/routes-legacy', getShippingRoutes);                // Legacy route listing
router.post('/calculate-transit', validateTransitCalculation, calculateTransitTime);
router.get('/documents', getRequiredDocuments);
router.post('/generate-document', generateDocument);
router.get('/restrictions', checkRestrictions);
router.post('/validate-route', validateRoute);

export default router; 