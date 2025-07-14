const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes and middleware
const pricingRoutes = require('./dist/routes/pricing').default;
const tariffRoutes = require('./dist/routes/tariffs').default;
const shippingRoutes = require('./dist/routes/shipping').default;

async function startTestServer() {
  try {
    // Start in-memory MongoDB
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Disconnect any existing connections first
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    // Connect to in-memory database
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to in-memory MongoDB');
    
    // Seed test data
    const { seedTariffs } = require('./dist/utils/tariffSeeder');
    await seedTariffs();
    console.log('✅ Test data seeded');
    
    // Create Express app
    const app = express();
    
    // Middleware
    app.use(helmet());
    app.use(cors());
    app.use(morgan('combined'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    
    // API version info
    app.get('/api/v1/', (req, res) => {
      res.json({
        success: true,
        message: 'LogisticsPricer API v1.0.0 (TEST MODE)',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
          pricing: '/api/v1/pricing',
          tariffs: '/api/v1/tariffs',
          shipping: '/api/v1/shipping',
        },
        features: {
          'Advanced Pricing': 'Complete pricing with duties and tariffs',
          'Tariff Management': 'HS code lookup and duty calculations',
          'International Shipping': 'Route validation and documentation',
          'Duty Calculation': 'Real-time duty and tariff calculations'
        }
      });
    });
    
    // Mount routes
    app.use('/api/v1/pricing', pricingRoutes);
    app.use('/api/v1/tariffs', tariffRoutes);
    app.use('/api/v1/shipping', shippingRoutes);
    
    // Error handling
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ 
        success: false, 
        error: { message: 'Internal server error' } 
      });
    });
    
    // Start server
    const PORT = process.env.PORT || 3001;
    const server = app.listen(PORT, () => {
      console.log(`🚀 Test server running on http://localhost:${PORT}`);
      console.log('📝 Available endpoints:');
      console.log('  GET  /api/v1/                    - API info');
      console.log('  POST /api/v1/pricing/calculate   - Calculate price');
      console.log('  GET  /api/v1/tariffs/rates       - Get tariff rates');
      console.log('  GET  /api/v1/tariffs/hs-codes    - Search HS codes');
      console.log('  POST /api/v1/tariffs/calculate   - Calculate duties');
      console.log('  GET  /api/v1/shipping/routes     - Get shipping routes');
      console.log('  POST /api/v1/shipping/calculate-transit - Calculate transit time');
      console.log('  GET  /api/v1/shipping/documents  - Get required documents');
      console.log('');
      console.log('Press Ctrl+C to stop the server');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down test server...');
      server.close();
      await mongoose.disconnect();
      await mongoServer.stop();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start test server:', error);
    process.exit(1);
  }
}

startTestServer(); 