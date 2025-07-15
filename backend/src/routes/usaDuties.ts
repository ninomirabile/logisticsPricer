import express from 'express';
import {
  getAllUSDuties,
  getUSDutyById,
  createUSDuty,
  updateUSDuty,
  deleteUSDuty,
  getUSDutyStats,
  searchUSDutiesByHSCode
} from '../controllers/usaDutiesController';

const router = express.Router();

// Get all USA duties with filtering and pagination
router.get('/', getAllUSDuties);

// Get USA duty statistics
router.get('/stats', getUSDutyStats);

// Search duties by HS code
router.get('/search/:hsCode', searchUSDutiesByHSCode);

// Get a single USA duty by ID
router.get('/:id', getUSDutyById);

// Create a new USA duty
router.post('/', createUSDuty);

// Update an existing USA duty
router.put('/:id', updateUSDuty);

// Delete a USA duty
router.delete('/:id', deleteUSDuty);

export default router; 