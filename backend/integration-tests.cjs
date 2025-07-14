const axios = require('axios');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Test configuration
const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000';
const API_BASE = `${BASE_URL}/api/v1`;

// Test data
const testPricingData = {
  origin: 'US',
  destination: 'IT',
  weight: 100,
  volume: 0.5,
  transportType: 'air',
  urgency: 'standard',
  options: {
    insurance: true,
    customsClearance: true,
    doorToDoor: false,
    temperatureControlled: false
  },
  hsCode: '8517.13.00',
  productValue: 1000
};

const testTariffData = {
  originCountry: 'US',
  destinationCountry: 'IT',
  hsCode: '8517.13.00',
  productValue: 1000
};

const testShippingData = {
  origin: 'US',
  destination: 'IT',
  transportType: 'air',
  productType: 'electronics',
  urgency: 'standard'
};

class IntegrationTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }

  async test(name, testFunction) {
    try {
      await testFunction();
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASSED' });
      await this.log(`✅ ${name}`);
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAILED', error: error.message });
      await this.log(`❌ ${name}: ${error.message}`);
    }
  }

  async runAllTests() {
    await this.log('🚀 Starting Integration Tests...');
    await this.log(`📡 Testing API at: ${API_BASE}`);

    // Health check
    await this.test('Health Check', async () => {
      const response = await axios.get(`${API_BASE}/`);
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }
      if (!response.data.success) {
        throw new Error('Health check returned success: false');
      }
    });

    // Pricing endpoints
    await this.test('Pricing Calculation', async () => {
      const response = await axios.post(`${API_BASE}/pricing/calculate`, testPricingData);
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }
      if (!response.data.success) {
        throw new Error('Pricing calculation failed');
      }
      if (!response.data.price) {
        throw new Error('No price in response');
      }
    });

    await this.test('Pricing Validation', async () => {
      const invalidData = { ...testPricingData, weight: -1 };
      try {
        await axios.post(`${API_BASE}/pricing/calculate`, invalidData);
        throw new Error('Should have failed with invalid data');
      } catch (error) {
        if (error.response.status !== 400) {
          throw new Error(`Expected status 400, got ${error.response.status}`);
        }
      }
    });

    // Tariff endpoints
    await this.test('Tariff Rates', async () => {
      const response = await axios.get(`${API_BASE}/tariffs/rates`, {
        params: {
          originCountry: 'US',
          destinationCountry: 'IT',
          hsCode: '8517.13.00'
        }
      });
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }
      if (!response.data.success) {
        throw new Error('Tariff rates request failed');
      }
      if (!Array.isArray(response.data.data)) {
        throw new Error('Tariff rates should be an array');
      }
    });

    await this.test('HS Code Search', async () => {
      const response = await axios.get(`${API_BASE}/tariffs/hs-codes?query=phone`);
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }
      if (!response.data.success) {
        throw new Error('HS code search failed');
      }
    });

    await this.test('Duty Calculation', async () => {
      const response = await axios.post(`${API_BASE}/tariffs/calculate`, testTariffData);
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }
      if (!response.data.success) {
        throw new Error('Duty calculation failed');
      }
      if (response.data.data.totalDuties === undefined) {
        throw new Error('No total duties in response');
      }
    });

    // Shipping endpoints
    await this.test('Shipping Routes', async () => {
      const response = await axios.get(`${API_BASE}/shipping/routes`);
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }
      if (!response.data.success) {
        throw new Error('Shipping routes request failed');
      }
      if (!Array.isArray(response.data.data)) {
        throw new Error('Shipping routes should be an array');
      }
    });

    await this.test('Required Documents', async () => {
      const response = await axios.get(`${API_BASE}/shipping/documents`, {
        params: {
          originCountry: 'US',
          destinationCountry: 'IT',
          productType: 'electronics',
          transportType: 'air',
          value: 1000
        }
      });
      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }
      if (!response.data.success) {
        throw new Error('Documents request failed');
      }
      if (!Array.isArray(response.data.data)) {
        throw new Error('Documents should be an array');
      }
    });

    // Error handling tests
    await this.test('404 Not Found', async () => {
      try {
        await axios.get(`${API_BASE}/nonexistent`);
        throw new Error('Should have returned 404');
      } catch (error) {
        if (error.response.status !== 404) {
          throw new Error(`Expected status 404, got ${error.response.status}`);
        }
      }
    });

    await this.test('Invalid JSON', async () => {
      try {
        await axios.post(`${API_BASE}/pricing/calculate`, 'invalid json', {
          headers: { 'Content-Type': 'application/json' }
        });
        throw new Error('Should have failed with invalid JSON');
      } catch (error) {
        if (error.response.status !== 400) {
          throw new Error(`Expected status 400, got ${error.response.status}`);
        }
      }
    });

    // Performance tests
    await this.test('Response Time < 2s', async () => {
      const start = Date.now();
      await axios.get(`${API_BASE}/`);
      const duration = Date.now() - start;
      if (duration > 2000) {
        throw new Error(`Response time too slow: ${duration}ms`);
      }
    });

    await this.test('Concurrent Requests', async () => {
      const requests = Array(5).fill().map(() => 
        axios.get(`${API_BASE}/`)
      );
      const responses = await Promise.all(requests);
      responses.forEach((response, index) => {
        if (response.status !== 200) {
          throw new Error(`Request ${index + 1} failed with status ${response.status}`);
        }
      });
    });

    // Print results
    await this.printResults();
  }

  async printResults() {
    await this.log('\n📊 Test Results:');
    await this.log(`✅ Passed: ${this.results.passed}`);
    await this.log(`❌ Failed: ${this.results.failed}`);
    await this.log(`📈 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);

    if (this.results.failed > 0) {
      await this.log('\n❌ Failed Tests:');
      this.results.tests
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          this.log(`  - ${test.name}: ${test.error}`);
        });
    }

    await this.log('\n🎯 All Tests:');
    this.results.tests.forEach(test => {
      const icon = test.status === 'PASSED' ? '✅' : '❌';
      this.log(`  ${icon} ${test.name}`);
    });

    // Exit with appropriate code
    if (this.results.failed > 0) {
      await this.log('\n💥 Integration tests failed!');
      process.exit(1);
    } else {
      await this.log('\n🎉 All integration tests passed!');
      process.exit(0);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new IntegrationTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = IntegrationTester; 