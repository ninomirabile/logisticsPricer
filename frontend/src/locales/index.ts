import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import commonIt from './it/common.json';
import adminIt from './it/admin.json';
import commonEn from './en/common.json';
import adminEn from './en/admin.json';

const resources = {
  it: {
    common: commonIt,
    admin: adminIt,
  },
  en: {
    common: commonEn,
    admin: adminEn,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    
    defaultNS: 'common',
    ns: ['common', 'admin'],
    
    react: {
      useSuspense: false,
    },
  });

export default i18n; 