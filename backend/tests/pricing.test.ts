import request from 'supertest';
import express from 'express';
import { errorHandler } from '../src/middleware/errorHandler';
import { notFound } from '../src/middleware/notFound';
import { rateLimiter } from '../src/middleware/rateLimiter';
import apiRoutes from '../src/routes';

const app = express();
app.use(express.json());
app.use(rateLimiter);
app.use('/api/v1', apiRoutes);
app.use(notFound);
app.use(errorHandler);

describe('POST /api/v1/pricing/calculate', () => {
  it('should return 400 for missing fields', async () => {
    const res = await request(app)
      .post('/api/v1/pricing/calculate')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toBeDefined();
  });

  it('should return 200 and a price for valid input', async () => {
    const res = await request(app)
      .post('/api/v1/pricing/calculate')
      .send({
        origin: 'CN',
        destination: 'US',
        weight: 1000,
        volume: 10,
        transportType: 'sea',
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.price).toBe('number');
    expect(res.body.price).toBeGreaterThan(0);
    expect(res.body.breakdown).toBeDefined();
    expect(res.body.breakdown.transport).toBeGreaterThan(0);
  });

  it('should calculate duties for electronics from China to US', async () => {
    const res = await request(app)
      .post('/api/v1/pricing/calculate')
      .send({
        origin: 'CN',
        destination: 'US',
        weight: 500,
        volume: 2,
        transportType: 'air',
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.breakdown.duties).toBeGreaterThanOrEqual(0);
  });
}); 