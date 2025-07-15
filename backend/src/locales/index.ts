import i18next from 'i18next';
import { Request } from 'express';

// Import translation files
import commonIt from './it/common.json';
import commonEn from './en/common.json';

const resources = {
  it: {
    common: commonIt,
  },
  en: {
    common: commonEn,
  },
};

i18next.init({
  resources,
  fallbackLng: 'en',
  debug: process.env.NODE_ENV === 'development',
  
  interpolation: {
    escapeValue: false,
  },
  
  defaultNS: 'common',
  ns: ['common'],
});

// Helper function to get language from request
export const getLanguage = (req: Request): string => {
  // Check Accept-Language header
  const acceptLanguage = req.headers['accept-language'];
  if (acceptLanguage) {
    if (acceptLanguage.includes('it')) return 'it';
    if (acceptLanguage.includes('en')) return 'en';
  }
  
  // Check custom header
  const customLang = req.headers['x-language'] as string;
  if (customLang && ['it', 'en'].includes(customLang)) {
    return customLang;
  }
  
  return 'en'; // Default fallback
};

// Helper function to translate with language context
export const t = (key: string, language: string = 'en', options?: any): string => {
  const result = i18next.t(key, { lng: language, ...options });
  return typeof result === 'string' ? result : String(result);
};

export default i18next; 