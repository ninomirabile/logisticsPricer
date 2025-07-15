import { Router } from 'express';
import { 
  calculatePrice,
  getAllPricingRequests,
  getPricingRequestById,
  createPricingRequest,
  updatePricingRequest,
  deletePricingRequest,
  getPricingStats,
  getAllPricingResponses,
  getPricingResponseById
} from '../controllers/pricingController';
import { validatePricingRequest } from '../middleware/validation';

const router = Router();

// CRUD operations for pricing requests
router.get('/requests', getAllPricingRequests);           // Get all pricing requests with filtering/pagination
router.get('/requests/stats', getPricingStats);           // Get pricing statistics
router.get('/requests/:id', getPricingRequestById);       // Get single pricing request by ID
router.post('/requests', createPricingRequest);           // Create new pricing request
router.put('/requests/:id', updatePricingRequest);        // Update existing pricing request
router.delete('/requests/:id', deletePricingRequest);     // Delete pricing request

// CRUD operations for pricing responses
router.get('/responses', getAllPricingResponses);         // Get all pricing responses with filtering/pagination
router.get('/responses/:id', getPricingResponseById);     // Get single pricing response by ID

// Legacy pricing calculation endpoint
router.post('/calculate', validatePricingRequest, calculatePrice); // Calculate freight transport cost

// Get pricing history (placeholder for future implementation)
router.get('/history', (req, res) => {
  res.json({
    success: true,
    message: 'Pricing history endpoint - to be implemented',
    data: [],
  });
});

export default router; 