import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PricingRequest, HSCode } from '../../types/pricing';

interface PricingFormProps {
  onSubmit: (request: PricingRequest) => void;
  isLoading: boolean;
}

export const PricingForm: React.FC<PricingFormProps> = ({ onSubmit, isLoading }) => {
  const { t } = useTranslation('common');
  const [formData, setFormData] = useState<PricingRequest>({
    origin: '',
    destination: '',
    weight: 0,
    volume: 0,
    transportType: 'road',
    urgency: 'standard',
    options: {
      insurance: false,
      customsClearance: false,
      doorToDoor: false,
      temperatureControlled: false,
    },
  });

  const [hsCodeSearch, setHsCodeSearch] = useState('');
  const [hsCodeResults, setHsCodeResults] = useState<HSCode[]>([]);
  const [showHsCodeResults, setShowHsCodeResults] = useState(false);
  const [isSearchingHs, setIsSearchingHs] = useState(false);

  // Ricerca codici HS - placeholder per ora
  useEffect(() => {
    const searchHsCodes = async () => {
      if (hsCodeSearch.length < 3) {
        setHsCodeResults([]);
        return;
      }

      setIsSearchingHs(true);
      try {
        // Placeholder - implementare quando disponibile
        setHsCodeResults([]);
        setShowHsCodeResults(false);
      } catch (error) {
        console.error('Errore nella ricerca codici HS:', error);
        setHsCodeResults([]);
      } finally {
        setIsSearchingHs(false);
      }
    };

    const timeoutId = setTimeout(searchHsCodes, 500);
    return () => clearTimeout(timeoutId);
  }, [hsCodeSearch]);

  const handleInputChange = (field: keyof PricingRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (option: keyof NonNullable<PricingRequest['options']>, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      options: { ...prev.options!, [option]: value }
    }));
  };

  const handleHsCodeSelect = (hsCode: HSCode) => {
    setFormData(prev => ({ ...prev, hsCode: hsCode.code }));
    setHsCodeSearch(hsCode.description);
    setShowHsCodeResults(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const countries = [
    { code: 'IT', name: t('countries.italy') },
    { code: 'DE', name: t('countries.germany') },
    { code: 'FR', name: t('countries.france') },
    { code: 'ES', name: t('countries.spain') },
    { code: 'CN', name: t('countries.china') },
    { code: 'US', name: t('countries.usa') },
    { code: 'GB', name: t('countries.uk') },
    { code: 'NL', name: t('countries.netherlands') },
    { code: 'BE', name: t('countries.belgium') },
    { code: 'AT', name: t('countries.austria') },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Origine e Destinazione */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('pricingForm.originCountry')} *
          </label>
          <select
            value={formData.origin}
            onChange={(e) => handleInputChange('origin', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('pricingForm.selectCountry')}</option>
            {countries.map(country => (
              <option key={country.code} value={country.code}>
                {country.name} ({country.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('pricingForm.destinationCountry')} *
          </label>
          <select
            value={formData.destination}
            onChange={(e) => handleInputChange('destination', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('pricingForm.selectCountry')}</option>
            {countries.map(country => (
              <option key={country.code} value={country.code}>
                {country.name} ({country.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Peso e Volume */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('pricingForm.weight')} *
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={formData.weight || ''}
            onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('pricingForm.weightPlaceholder')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('pricingForm.volume')} *
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={formData.volume || ''}
            onChange={(e) => handleInputChange('volume', parseFloat(e.target.value) || 0)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('pricingForm.volumePlaceholder')}
          />
        </div>
      </div>

      {/* Tipo di Trasporto e Urgenza */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('pricingForm.transportType')} *
          </label>
          <select
            value={formData.transportType}
            onChange={(e) => handleInputChange('transportType', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="road">🚛 {t('pricingForm.byRoad')}</option>
            <option value="sea">🚢 {t('pricingForm.bySea')}</option>
            <option value="air">✈️ {t('pricingForm.byAir')}</option>
            <option value="rail">🚂 {t('pricingForm.byRail')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('pricingForm.urgency')}
          </label>
          <select
            value={formData.urgency}
            onChange={(e) => handleInputChange('urgency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="standard">{t('pricingForm.standard')}</option>
            <option value="express">{t('pricingForm.express')}</option>
            <option value="urgent">{t('pricingForm.urgent')}</option>
          </select>
        </div>
      </div>

      {/* Codice HS e Valore Prodotto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('pricingForm.hsCode')}
          </label>
          <input
            type="text"
            value={hsCodeSearch}
            onChange={(e) => setHsCodeSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('pricingForm.hsCodePlaceholder')}
          />
          {isSearchingHs && (
            <div className="absolute right-3 top-8">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
          
          {/* Risultati ricerca HS */}
          {showHsCodeResults && hsCodeResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              {hsCodeResults.map((hsCode) => (
                <div
                  key={hsCode.code}
                  onClick={() => handleHsCodeSelect(hsCode)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-sm">{hsCode.code}</div>
                  <div className="text-xs text-gray-600">{hsCode.description}</div>
                  <div className="text-xs text-gray-500">{hsCode.category}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('pricingForm.productValue')}
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.productValue || ''}
            onChange={(e) => handleInputChange('productValue', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('pricingForm.productValuePlaceholder')}
          />
        </div>
      </div>

      {/* Opzioni Aggiuntive */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t('pricingForm.additionalOptions')}
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.options?.insurance || false}
              onChange={(e) => handleOptionChange('insurance', e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">{t('pricingForm.insurance')}</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.options?.customsClearance || false}
              onChange={(e) => handleOptionChange('customsClearance', e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">{t('pricingForm.customsClearance')}</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.options?.doorToDoor || false}
              onChange={(e) => handleOptionChange('doorToDoor', e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">{t('pricingForm.doorToDoor')}</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.options?.temperatureControlled || false}
              onChange={(e) => handleOptionChange('temperatureControlled', e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">{t('pricingForm.temperatureControlled')}</span>
          </label>
        </div>
      </div>

      {/* Pulsante Calcola */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {t('pricingForm.calculating')}
            </div>
          ) : (
            `🚚 ${t('pricingForm.calculatePrice')}`
          )}
        </button>
      </div>
    </form>
  );
}; 