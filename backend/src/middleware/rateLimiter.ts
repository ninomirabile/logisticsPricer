import rateLimit from 'express-rate-limit';

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

export const rateLimiter = rateLimit({
  windowMs,
  max: maxRequests,
  message: {
    success: false,
    error: {
      message: `Too many requests from this IP, please try again after ${Math.floor(windowMs / 60000)} minutes`,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        message: `Too many requests from this IP, please try again after ${Math.floor(windowMs / 60000)} minutes`,
      },
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  },
}); 