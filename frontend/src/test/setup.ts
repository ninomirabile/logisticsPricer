/// <reference types="vitest/globals" />
import '@testing-library/jest-dom';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Mock fetch globally
globalThis.fetch = vi.fn() as unknown as typeof fetch;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Setup i18n for tests
i18n
  .use(initReactI18next)
  .init({
    lng: 'it', // Set default language for tests
    fallbackLng: 'it',
    debug: false,
    
    resources: {
      it: {
        common: {
          pricingForm: {
            originCountry: 'Paese di Origine',
            destinationCountry: 'Paese di Destinazione',
            weight: 'Peso (kg)',
            volume: 'Volume (m³)',
            transportType: 'Tipo di Trasporto',
            selectCountry: 'Seleziona paese',
            weightPlaceholder: 'Es. 100',
            volumePlaceholder: 'Es. 0.5',
            byRoad: 'Su Strada',
            bySea: 'Via Mare',
            byAir: 'Via Aerea',
            byRail: 'Via Ferrovia',
            urgency: 'Urgenza',
            standard: 'Standard',
            express: 'Express',
            urgent: 'Urgente',
            hsCode: 'Codice HS (opzionale)',
            hsCodePlaceholder: 'Cerca prodotto (es. smartphone)',
            productValue: 'Valore Prodotto (€)',
            productValuePlaceholder: 'Es. 1000',
            additionalOptions: 'Opzioni Aggiuntive',
            insurance: 'Assicurazione',
            customsClearance: 'Sdoganamento',
            doorToDoor: 'Porta a Porta',
            temperatureControlled: 'Controllo Temperatura',
            calculating: 'Calcolando...',
            calculatePrice: 'Calcola Prezzo'
          },
          countries: {
            italy: 'Italia',
            germany: 'Germania',
            france: 'Francia',
            spain: 'Spagna',
            china: 'Cina',
            usa: 'Stati Uniti',
            uk: 'Regno Unito',
            netherlands: 'Paesi Bassi',
            belgium: 'Belgio',
            austria: 'Austria'
          }
        }
      }
    },
    
    interpolation: {
      escapeValue: false,
    },
    
    react: {
      useSuspense: false,
    },
  });
