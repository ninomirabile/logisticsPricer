import { Router } from 'express';

const router = Router();

// User routes (placeholder for future implementation)
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    message: 'User profile endpoint - to be implemented',
  });
});

router.put('/profile', (req, res) => {
  res.json({
    success: true,
    message: 'Update user profile endpoint - to be implemented',
  });
});

export default router; 