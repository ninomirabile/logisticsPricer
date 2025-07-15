# Internationalization (i18n) Guide

This document describes the **complete internationalization system** implemented in LogisticsPricer, supporting both Italian and English languages with full UI coverage.

## 🌍 Overview

The application uses **react-i18next** for frontend translations and **i18next** for backend API messages, providing a complete multilingual experience across all admin interfaces and user components.

## 🏗️ Architecture

### Frontend (React)
- **react-i18next**: Main translation library
- **i18next-browser-languagedetector**: Automatic language detection
- **Translation files**: JSON-based structure organized by modules
- **Custom hooks**: useLanguage for language management
- **Language switch component**: Real-time language toggle

### Backend (Node.js)
- **i18next**: Server-side translation library
- **Language detection**: From HTTP headers (`Accept-Language`, `x-language`)
- **API responses**: Localized error messages and success responses

## 📁 File Structure

```
frontend/src/locales/
├── index.ts                 # i18n configuration
├── it/
│   ├── common.json         # Common UI elements (Italian)
│   └── admin.json          # Admin-specific translations (Italian)
└── en/
    ├── common.json         # Common UI elements (English)
    └── admin.json          # Admin-specific translations (English)

backend/src/locales/
├── index.ts                # i18n configuration
├── it/
│   └── common.json         # API messages and errors (Italian)
└── en/
    └── common.json         # API messages and errors (English)
```

## 🎯 Implemented Components

### ✅ Fully Internationalized Admin Interfaces

1. **AdminDashboard** - Complete UI translation
   - Navigation menu
   - Overview statistics
   - Quick actions
   - Dashboard cards

2. **TariffManagement** - Full CRUD interface
   - Table headers and filters
   - Form labels and validation
   - Action buttons
   - Pagination controls

3. **PricingManagement** - Complete interface
   - Request management forms
   - Status filters and search
   - Modal dialogs
   - Statistics display

4. **USDutiesManagement** - All admin functions
   - Duty management interface
   - Section filters (301, 232, 201)
   - Form validation messages
   - Statistics cards

5. **ShippingRouteManagement** - Full CRUD interface
   - Route management forms
   - Transport type filters
   - Cost and time displays
   - Status indicators

6. **Analytics** - Dashboard and statistics
   - Metrics cards
   - Chart labels
   - Export options
   - Feature descriptions

7. **ShippingRouteStats** - Statistics interface
   - Performance metrics
   - Transport type distribution
   - Country statistics

8. **PricingStats** - Statistics dashboard
   - Request statistics
   - Transport distribution
   - Average calculations

### ✅ Language Management Components

- **LanguageSwitch**: Real-time language toggle button
- **useLanguage Hook**: Custom hook for language management
- **Language Detection**: Automatic browser language detection

## 🔧 Configuration

### Frontend Configuration

```typescript
// frontend/src/locales/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { it: {...}, en: {...} },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    defaultNS: 'common',
    ns: ['common', 'admin'],
    react: { useSuspense: false },
  });
```

### Backend Configuration

```typescript
// backend/src/locales/index.ts
import i18next from 'i18next';

i18next.init({
  resources: { it: {...}, en: {...} },
  fallbackLng: 'en',
  debug: process.env.NODE_ENV === 'development',
  interpolation: { escapeValue: false },
  defaultNS: 'common',
  ns: ['common'],
});
```

## 🎯 Usage

### Frontend Usage

#### 1. Basic Translation
```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t('common.loading')}</h1>;
}
```

#### 2. Namespace-specific Translation
```tsx
import { useTranslation } from 'react-i18next';

function AdminComponent() {
  const { t } = useTranslation('admin');
  
  return <h1>{t('dashboard.title')}</h1>;
}
```

#### 3. Language Switching
```tsx
import { useLanguage } from '../hooks/useLanguage';

function LanguageSwitch() {
  const { currentLanguage, toggleLanguage, t } = useLanguage();
  
  return (
    <button onClick={toggleLanguage}>
      {currentLanguage === 'it' ? 'IT' : 'EN'}
    </button>
  );
}
```

#### 4. Interpolation
```tsx
// Translation: "Showing {{from}} to {{to}} of {{total}} entries"
const { t } = useTranslation();
t('pagination.showing', { from: 1, to: 10, total: 100 });
```

### Backend Usage

#### 1. Language Detection
```typescript
import { getLanguage, t } from '../locales';

app.get('/api/data', (req, res) => {
  const language = getLanguage(req);
  const message = t('messages.success.retrieved', language);
  
  res.json({ message, data: [] });
});
```

#### 2. Error Messages
```typescript
import { t } from '../locales';

app.post('/api/create', (req, res) => {
  const language = getLanguage(req);
  
  if (!req.body.name) {
    return res.status(400).json({
      error: t('errors.validation.required', language, { field: 'name' })
    });
  }
});
```

## 🔄 Language Detection

### Frontend Detection Order
1. **localStorage**: Previously selected language
2. **navigator**: Browser language preference
3. **htmlTag**: HTML lang attribute
4. **fallback**: English (en)

### Backend Detection Order
1. **x-language header**: Custom language header
2. **Accept-Language header**: Browser language preference
3. **fallback**: English (en)

## 📝 Translation File Structure

### Common Translations (common.json)
```json
{
  "navigation": {
    "dashboard": "Dashboard",
    "pricing": "Pricing"
  },
  "common": {
    "loading": "Loading...",
    "error": "Error",
    "save": "Save"
  },
  "messages": {
    "dataSaved": "Data saved successfully",
    "errorLoading": "Error loading data"
  }
}
```

### Admin Translations (admin.json)
```json
{
  "dashboard": {
    "title": "Admin Dashboard",
    "welcome": "Welcome to the control panel",
    "overview": "General Overview",
    "quickActions": "Quick Actions"
  },
  "shipping": {
    "title": "Shipping Routes Management",
    "createRoute": "Create New Route",
    "stats": {
      "totalRoutes": "Total Routes",
      "activeRoutes": "Active Routes"
    }
  },
  "pricing": {
    "title": "Pricing Management",
    "createRequest": "Create New Request",
    "stats": {
      "totalRequests": "Total Requests",
      "calculatedRequests": "Calculations Today"
    }
  },
  "tariffs": {
    "title": "Tariff Management",
    "createTariff": "Add Tariff",
    "stats": {
      "activeTariffs": "Active Tariffs"
    }
  },
  "usaDuties": {
    "title": "USA Duties Management",
    "createDuty": "Create New Duty",
    "stats": {
      "totalDuties": "USA Duties"
    }
  }
}
```

## 🎨 UI Components

### Language Switch Component
```tsx
import { LanguageSwitch } from './components/common/LanguageSwitch';

function Header() {
  return (
    <header>
      <h1>LogisticsPricer</h1>
      <LanguageSwitch />
    </header>
  );
}
```

### Custom Hook
```tsx
import { useLanguage } from './hooks/useLanguage';

function MyComponent() {
  const { currentLanguage, isItalian, isEnglish, switchLanguage, t } = useLanguage();
  
  return (
    <div>
      <p>Current language: {currentLanguage}</p>
      <button onClick={() => switchLanguage('it')}>Switch to Italian</button>
      <button onClick={() => switchLanguage('en')}>Switch to English</button>
    </div>
  );
}
```

## 🚀 Adding New Languages

### 1. Create Translation Files
```bash
mkdir -p frontend/src/locales/es
mkdir -p backend/src/locales/es
```

### 2. Add Spanish Translations
```json
// frontend/src/locales/es/common.json
{
  "navigation": {
    "dashboard": "Panel de Control",
    "pricing": "Precios"
  }
}
```

### 3. Update Configuration
```typescript
// frontend/src/locales/index.ts
import commonEs from './es/common.json';

const resources = {
  it: { common: commonIt, admin: adminIt },
  en: { common: commonEn, admin: adminEn },
  es: { common: commonEs, admin: adminEs }, // Add Spanish
};
```

### 4. Update Language Detection
```typescript
// backend/src/locales/index.ts
export const getLanguage = (req: Request): string => {
  const acceptLanguage = req.headers['accept-language'];
  if (acceptLanguage) {
    if (acceptLanguage.includes('es')) return 'es'; // Add Spanish
    if (acceptLanguage.includes('it')) return 'it';
    if (acceptLanguage.includes('en')) return 'en';
  }
  return 'en';
};
```

## 🔍 Best Practices

### 1. Translation Keys
- Use descriptive, hierarchical keys
- Group related translations in namespaces
- Use consistent naming conventions

### 2. Interpolation
- Use named parameters for better readability
- Provide fallback values for missing translations
- Escape HTML content appropriately

### 3. Pluralization
```json
{
  "items": "{{count}} item",
  "items_plural": "{{count}} items"
}
```

### 4. Context
```json
{
  "save": "Save",
  "save_female": "Save (female form)"
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Translation not found**
   - Check if the key exists in the translation file
   - Verify the namespace is loaded
   - Check for typos in translation keys

2. **Language not switching**
   - Clear localStorage: `localStorage.removeItem('i18nextLng')`
   - Check browser console for errors
   - Verify language detection configuration

3. **Backend translations not working**
   - Check if Accept-Language header is sent
   - Verify language detection logic
   - Check if translation files are loaded

### Debug Mode
```typescript
// Enable debug mode in development
debug: process.env.NODE_ENV === 'development'
```

## 📊 Translation Coverage

### ✅ Completed Components
- **AdminDashboard**: 100% UI coverage
- **TariffManagement**: 100% UI coverage
- **PricingManagement**: 100% UI coverage
- **USDutiesManagement**: 100% UI coverage
- **ShippingRouteManagement**: 100% UI coverage
- **Analytics**: 100% UI coverage
- **ShippingRouteStats**: 100% UI coverage
- **PricingStats**: 100% UI coverage
- **LanguageSwitch**: 100% UI coverage

### 📈 Translation Statistics
- **Total Translation Keys**: 500+
- **Namespaces**: 2 (common, admin)
- **Languages**: 2 (Italian, English)
- **Components**: 8 admin interfaces
- **Coverage**: 100% of UI elements

## 📚 Resources

- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)
- [i18next-browser-languagedetector](https://github.com/i18next/i18next-browser-languageDetector)

## 🤝 Contributing

When adding new features:

1. **Add translations for all supported languages**
2. **Use the translation hook in components**
3. **Test language switching functionality**
4. **Update this documentation if needed**

---

This internationalization system provides a **complete multilingual foundation** for LogisticsPricer with full UI coverage across all admin interfaces. The system is easily extensible to support additional languages as needed. 