import { Router } from 'express';
import pricingRoutes from './pricing';
import tariffRoutes from './tariffs';
import shippingRoutes from './shipping';
import authRoutes from './auth';
import userRoutes from './users';

const router = Router();

// API version info
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'LogisticsPricer API v1.0.0',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      pricing: '/pricing',
      tariffs: '/tariffs',
      shipping: '/shipping',
      auth: '/auth',
      users: '/users',
    },
    features: {
      'Advanced Pricing': 'Complete pricing with duties and tariffs',
      'Tariff Management': 'HS code lookup and duty calculations',
      'International Shipping': 'Route validation and documentation',
      'Duty Calculation': 'Real-time duty and tariff calculations'
    }
  });
});

// Mount route modules
router.use('/pricing', pricingRoutes);
router.use('/tariffs', tariffRoutes);
router.use('/shipping', shippingRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router; 