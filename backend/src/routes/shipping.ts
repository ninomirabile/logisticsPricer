import { Router } from 'express';
import { 
  getShippingRoutes, 
  calculateTransitTime, 
  getRequiredDocuments, 
  generateDocument, 
  checkRestrictions, 
  validateRoute 
} from '../controllers/shippingController';
import { validateTransitCalculation } from '../middleware/validation';

const router = Router();

// Get available shipping routes
router.get('/routes', getShippingRoutes);

// Calculate transit time
router.post('/calculate-transit', validateTransitCalculation, calculateTransitTime);

// Get required documents
router.get('/documents', getRequiredDocuments);

// Generate customs document
router.post('/generate-document', generateDocument);

// Check shipping restrictions
router.get('/restrictions', checkRestrictions);

// Validate shipping route
router.post('/validate-route', validateRoute);

export default router; 