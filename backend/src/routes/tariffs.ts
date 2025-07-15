import { Router } from 'express';
import { 
  getAllTariffs,
  getTariffById,
  createTariff,
  updateTariff,
  deleteTariff,
  getTariffStats,
  searchTariffsByHSCode,
  getTariffRates, 
  searchHSCodes, 
  calculateDuties, 
  getTariffHistory, 
  updateTariffRates 
} from '../controllers/tariffController';
import { validateDutyCalculation, validateTariffUpdate } from '../middleware/validation';

const router = Router();

// CRUD operations for tariff management
router.get('/', getAllTariffs);                    // Get all tariffs with filtering/pagination
router.get('/stats', getTariffStats);              // Get tariff statistics
router.get('/rates', getTariffRates);              // Get tariff rates for country pair and HS code
router.get('/hs-codes', searchHSCodes);            // Search HS codes by description
router.get('/history', getTariffHistory);          // Get tariff change history
router.get('/search/:hsCode', searchTariffsByHSCode); // Search by HS code
router.get('/:id', getTariffById);                 // Get single tariff by ID (deve venire dopo le route specifiche)
router.post('/', createTariff);                    // Create new tariff
router.put('/:id', updateTariff);                  // Update existing tariff
router.delete('/:id', deleteTariff);               // Delete tariff
router.post('/calculate', validateDutyCalculation, calculateDuties); // Calculate duties for shipment
router.post('/update', validateTariffUpdate, updateTariffRates); // Update tariff rates (admin)

export default router; 