import { Router } from 'express';
import { calculatePrice } from '../controllers/pricingController';
import { validatePricingRequest } from '../middleware/validation';

const router = Router();

// Calculate freight transport cost
router.post('/calculate', validatePricingRequest, calculatePrice);

// Get pricing history (placeholder for future implementation)
router.get('/history', (req, res) => {
  res.json({
    success: true,
    message: 'Pricing history endpoint - to be implemented',
    data: [],
  });
});

export default router; 