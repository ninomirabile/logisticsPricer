import { Router } from 'express';
import { 
  getTariffRates, 
  searchHSCodes, 
  calculateDuties, 
  getTariffHistory, 
  updateTariffRates 
} from '../controllers/tariffController';
import { validateDutyCalculation, validateTariffUpdate } from '../middleware/validation';

const router = Router();

// Get tariff rates for country pair and HS code
router.get('/rates', getTariffRates);

// Search HS codes by description
router.get('/hs-codes', searchHSCodes);

// Calculate duties for shipment
router.post('/calculate', validateDutyCalculation, calculateDuties);

// Get tariff change history
router.get('/history', getTariffHistory);

// Update tariff rates (admin)
router.post('/update', validateTariffUpdate, updateTariffRates);

export default router; 