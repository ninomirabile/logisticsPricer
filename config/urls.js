// Centralized URL Configuration for LogisticsPricer
// This file manages all URLs and domains across the application

const config = {
  // Base URLs for different environments
  development: {
    BASE_URL: process.env.DEV_BASE_URL || 'http://localhost:3000',
    API_URL: process.env.DEV_API_URL || 'http://localhost:3001',
    DOMAIN: process.env.DEV_DOMAIN || 'localhost',
    PROTOCOL: 'http'
  },
  
  staging: {
    BASE_URL: process.env.STAGING_BASE_URL || 'https://staging.your-domain.com',
    API_URL: process.env.STAGING_API_URL || 'https://api-staging.your-domain.com',
    DOMAIN: process.env.STAGING_DOMAIN || 'staging.your-domain.com',
    PROTOCOL: 'https'
  },
  
  production: {
    BASE_URL: process.env.PROD_BASE_URL || 'https://your-domain.com',
    API_URL: process.env.PROD_API_URL || 'https://api.your-domain.com',
    DOMAIN: process.env.PROD_DOMAIN || 'your-domain.com',
    PROTOCOL: 'https'
  }
};

// Get current environment
const environment = process.env.NODE_ENV || 'development';

// Export current environment config
const currentConfig = config[environment];

// Helper functions
const getUrl = (path = '') => {
  return `${currentConfig.BASE_URL}${path}`;
};

const getApiUrl = (path = '') => {
  return `${currentConfig.API_URL}${path}`;
};

const getDomain = () => {
  return currentConfig.DOMAIN;
};

const getProtocol = () => {
  return currentConfig.PROTOCOL;
};

// API endpoints
const apiEndpoints = {
  // Pricing endpoints
  pricing: {
    calculate: '/api/v1/pricing/calculate',
    history: '/api/v1/pricing/history',
    estimate: '/api/v1/pricing/estimate'
  },
  
  // Tariff endpoints
  tariffs: {
    rates: '/api/v1/tariffs/rates',
    search: '/api/v1/tariffs/hs-codes',
    calculate: '/api/v1/tariffs/calculate',
    lookup: '/api/v1/tariffs/lookup'
  },
  
  // Shipping endpoints
  shipping: {
    routes: '/api/v1/shipping/routes',
    transit: '/api/v1/shipping/calculate-transit',
    documents: '/api/v1/shipping/documents',
    restrictions: '/api/v1/shipping/restrictions'
  },
  
  // Health and status
  health: '/api/v1/',
  status: '/api/v1/status',
  
  // Documentation
  docs: '/api/v1/docs',
  swagger: '/api/v1/swagger'
};

// Frontend routes
const frontendRoutes = {
  home: '/',
  pricing: '/pricing',
  tariffs: '/tariffs',
  shipping: '/shipping',
  about: '/about',
  contact: '/contact',
  login: '/login',
  register: '/register',
  dashboard: '/dashboard'
};

// Export configuration
module.exports = {
  // Current environment config
  ...currentConfig,
  
  // Helper functions
  getUrl,
  getApiUrl,
  getDomain,
  getProtocol,
  
  // Endpoints
  api: apiEndpoints,
  routes: frontendRoutes,
  
  // Environment info
  environment,
  isDevelopment: environment === 'development',
  isStaging: environment === 'staging',
  isProduction: environment === 'production',
  
  // All configs for reference
  configs: config
}; 