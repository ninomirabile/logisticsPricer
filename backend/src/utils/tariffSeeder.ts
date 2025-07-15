import TariffRate from '../models/TariffRate';

// Sample tariff data for development and testing
const sampleTariffs = [
  // US tariffs on Chinese goods (Section 301)
  {
    originCountry: 'CN',
    destinationCountry: 'US',
    hsCode: '8517.13.00',
    baseRate: 25.0, // 25% Section 301 tariff
    specialRate: 0,
    effectiveDate: new Date('2018-07-06'),
    source: 'MANUAL',
    notes: 'Section 301 tariff on Chinese electronics'
  },
  {
    originCountry: 'CN',
    destinationCountry: 'US',
    hsCode: '7326.90.86',
    baseRate: 25.0,
    specialRate: 0,
    effectiveDate: new Date('2018-07-06'),
    source: 'MANUAL',
    notes: 'Section 301 tariff on Chinese steel products'
  },
  
  // EU tariffs
  {
    originCountry: 'CN',
    destinationCountry: 'EU',
    hsCode: '8517.13.00',
    baseRate: 3.7,
    specialRate: 0,
    effectiveDate: new Date('2020-01-01'),
    source: 'MANUAL',
    notes: 'Standard EU tariff on electronics'
  },
  
  // General tariffs for common products
  {
    originCountry: 'CN',
    destinationCountry: 'US',
    hsCode: '9503.00.00',
    baseRate: 0.0, // Duty-free
    specialRate: 0,
    effectiveDate: new Date('2020-01-01'),
    source: 'MANUAL',
    notes: 'Duty-free toys and games'
  },
  {
    originCountry: 'CN',
    destinationCountry: 'EU',
    hsCode: '9503.00.00',
    baseRate: 0.0,
    specialRate: 0,
    effectiveDate: new Date('2020-01-01'),
    source: 'MANUAL',
    notes: 'Duty-free toys and games'
  },
  
  // Textiles
  {
    originCountry: 'CN',
    destinationCountry: 'US',
    hsCode: '6104.43.20',
    baseRate: 16.0,
    specialRate: 0,
    effectiveDate: new Date('2020-01-01'),
    source: 'MANUAL',
    notes: 'Standard tariff on women\'s dresses'
  },
  {
    originCountry: 'CN',
    destinationCountry: 'EU',
    hsCode: '6104.43.20',
    baseRate: 12.0,
    specialRate: 0,
    effectiveDate: new Date('2020-01-01'),
    source: 'MANUAL',
    notes: 'Standard EU tariff on women\'s dresses'
  },
  
  // Machinery
  {
    originCountry: 'CN',
    destinationCountry: 'US',
    hsCode: '8471.30.01',
    baseRate: 0.0,
    specialRate: 0,
    effectiveDate: new Date('2020-01-01'),
    source: 'MANUAL',
    notes: 'Duty-free portable computers'
  },
  {
    originCountry: 'CN',
    destinationCountry: 'EU',
    hsCode: '8471.30.01',
    baseRate: 0.0,
    specialRate: 0,
    effectiveDate: new Date('2020-01-01'),
    source: 'MANUAL',
    notes: 'Duty-free portable computers'
  },
  
  // Add tariffs for US-IT test case
  {
    originCountry: 'US',
    destinationCountry: 'IT',
    hsCode: '8517.13.00',
    baseRate: 0.0, // Duty-free
    specialRate: 0,
    effectiveDate: new Date('2020-01-01'),
    source: 'MANUAL',
    notes: 'Duty-free electronics from US to Italy'
  },
  {
    originCountry: 'IT',
    destinationCountry: 'US',
    hsCode: '8517.13.00',
    baseRate: 0.0, // Duty-free
    specialRate: 0,
    effectiveDate: new Date('2020-01-01'),
    source: 'MANUAL',
    notes: 'Duty-free electronics from Italy to US'
  }
];

export const seedTariffs = async (): Promise<void> => {
  try {
    // Clear existing tariffs
    await TariffRate.deleteMany({});
    
    // Insert sample tariffs
    await TariffRate.insertMany(sampleTariffs);
    
    console.log('✅ Tariff data seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding tariff data:', error);
    throw error;
  }
};

export const getSampleTariffs = (): typeof sampleTariffs => {
  return sampleTariffs;
}; 