const mongoose = require('mongoose');
const { seedTariffs } = require('./dist/utils/tariffSeeder');

// Sample shipping routes data
const sampleShippingRoutes = [
  {
    routeId: 'CN-US-SEA-001',
    originCountry: 'CN',
    destinationCountry: 'US',
    transportType: 'sea',
    baseTransitTime: 21,
    customsDelay: 3,
    portCongestion: 2,
    restrictions: ['FCC certification required', 'FDA approval for food items'],
    requirements: {
      documents: [
        { type: 'Commercial Invoice', required: true, priority: 'high', description: 'Detailed invoice with product description' },
        { type: 'Packing List', required: true, priority: 'high', description: 'Itemized list of contents' },
        { type: 'Bill of Lading', required: true, priority: 'high', description: 'Shipping document' },
        { type: 'Certificate of Origin', required: false, priority: 'medium', description: 'Country of origin certificate' }
      ],
      specialHandling: ['Fragile items', 'Temperature controlled'],
      certifications: ['FCC', 'FDA', 'CE']
    },
    costs: {
      baseCost: 2500,
      customsFees: 150,
      portFees: 200,
      additionalFees: 100
    },
    isActive: true,
    effectiveDate: new Date('2024-01-01'),
    notes: 'Primary sea route from China to US West Coast',
    source: 'MANUAL'
  },
  {
    routeId: 'CN-US-AIR-001',
    originCountry: 'CN',
    destinationCountry: 'US',
    transportType: 'air',
    baseTransitTime: 3,
    customsDelay: 1,
    portCongestion: 0,
    restrictions: ['Battery restrictions apply', 'Size limitations'],
    requirements: {
      documents: [
        { type: 'Air Waybill', required: true, priority: 'high', description: 'Air freight document' },
        { type: 'Commercial Invoice', required: true, priority: 'high', description: 'Detailed invoice' },
        { type: 'Packing List', required: true, priority: 'high', description: 'Itemized list' }
      ],
      specialHandling: ['Express handling', 'Security screening'],
      certifications: ['IATA', 'TSA']
    },
    costs: {
      baseCost: 8500,
      customsFees: 200,
      portFees: 50,
      additionalFees: 300
    },
    isActive: true,
    effectiveDate: new Date('2024-01-01'),
    notes: 'Express air route from China to US',
    source: 'MANUAL'
  },
  {
    routeId: 'IT-DE-ROAD-001',
    originCountry: 'IT',
    destinationCountry: 'DE',
    transportType: 'road',
    baseTransitTime: 2,
    customsDelay: 0,
    portCongestion: 0,
    restrictions: ['EU regulations apply'],
    requirements: {
      documents: [
        { type: 'CMR Document', required: true, priority: 'high', description: 'International road transport document' },
        { type: 'Commercial Invoice', required: true, priority: 'high', description: 'Detailed invoice' },
        { type: 'Packing List', required: true, priority: 'medium', description: 'Itemized list' }
      ],
      specialHandling: ['Standard handling'],
      certifications: ['CE marking']
    },
    costs: {
      baseCost: 800,
      customsFees: 0,
      portFees: 0,
      additionalFees: 50
    },
    isActive: true,
    effectiveDate: new Date('2024-01-01'),
    notes: 'Standard road route within EU',
    source: 'MANUAL'
  }
];

// Sample USA duties data
const sampleUSADuties = [
  {
    hsCode: '8517.13.00',
    description: 'Smartphones and mobile phones',
    baseRate: 0,
    section301: 25,
    section232: 0,
    section201: 0,
    source: 'MANUAL',
    isActive: true,
    effectiveDate: new Date('2018-07-06'),
    notes: 'Section 301 tariff on Chinese electronics'
  },
  {
    hsCode: '7326.90.86',
    description: 'Steel products',
    baseRate: 0,
    section301: 25,
    section232: 25,
    section201: 0,
    source: 'MANUAL',
    isActive: true,
    effectiveDate: new Date('2018-07-06'),
    notes: 'Section 301 and 232 tariffs on Chinese steel'
  },
  {
    hsCode: '9503.00.00',
    description: 'Toys and games',
    baseRate: 0,
    section301: 0,
    section232: 0,
    section201: 0,
    source: 'MANUAL',
    isActive: true,
    effectiveDate: new Date('2020-01-01'),
    notes: 'Duty-free toys and games'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/logisticspricer';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import models - use require directly
    const ShippingRoute = require('./dist/models/ShippingRoute');
    const USDuty = require('./dist/models/USDuty');
    const TariffRate = require('./dist/models/TariffRate');

    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await ShippingRoute.deleteMany({});
    await USDuty.deleteMany({});

    // Seed tariffs
    console.log('📊 Seeding tariff data...');
    await seedTariffs();

    // Seed shipping routes
    console.log('🚢 Seeding shipping routes...');
    await ShippingRoute.insertMany(sampleShippingRoutes);

    // Seed USA duties
    console.log('🇺🇸 Seeding USA duties...');
    await USDuty.insertMany(sampleUSADuties);

    console.log('✅ Database seeded successfully!');
    console.log(`📊 Added ${sampleShippingRoutes.length} shipping routes`);
    console.log(`🇺🇸 Added ${sampleUSADuties.length} USA duties`);

    // Show some statistics
    const routeCount = await ShippingRoute.countDocuments();
    const dutyCount = await USDuty.countDocuments();
    const tariffCount = await TariffRate.countDocuments();

    console.log('\n📈 Database Statistics:');
    console.log(`   Shipping Routes: ${routeCount}`);
    console.log(`   USA Duties: ${dutyCount}`);
    console.log(`   Tariff Rates: ${tariffCount}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeding
seedDatabase(); 