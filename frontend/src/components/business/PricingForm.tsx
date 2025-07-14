import React, { useState, useEffect } from 'react';
import { PricingRequest, HSCode } from '../../types/pricing';
import { searchHSCodes } from '../../services/pricingService';

interface PricingFormProps {
  onSubmit: (request: PricingRequest) => void;
  isLoading: boolean;
}

export const PricingForm: React.FC<PricingFormProps> = ({ onSubmit, isLoading }) => {
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

  // Ricerca codici HS
  useEffect(() => {
    const searchHsCodes = async () => {
      if (hsCodeSearch.length < 3) {
        setHsCodeResults([]);
        return;
      }

      setIsSearchingHs(true);
      try {
        const response = await searchHSCodes(hsCodeSearch);
        setHsCodeResults(response.data);
        setShowHsCodeResults(true);
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
    { code: 'IT', name: 'Italia' },
    { code: 'DE', name: 'Germania' },
    { code: 'FR', name: 'Francia' },
    { code: 'ES', name: 'Spagna' },
    { code: 'CN', name: 'Cina' },
    { code: 'US', name: 'Stati Uniti' },
    { code: 'GB', name: 'Regno Unito' },
    { code: 'NL', name: 'Paesi Bassi' },
    { code: 'BE', name: 'Belgio' },
    { code: 'AT', name: 'Austria' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Origine e Destinazione */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paese di Origine *
          </label>
          <select
            value={formData.origin}
            onChange={(e) => handleInputChange('origin', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleziona paese</option>
            {countries.map(country => (
              <option key={country.code} value={country.code}>
                {country.name} ({country.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paese di Destinazione *
          </label>
          <select
            value={formData.destination}
            onChange={(e) => handleInputChange('destination', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleziona paese</option>
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
            Peso (kg) *
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={formData.weight || ''}
            onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Es. 100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Volume (m³) *
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={formData.volume || ''}
            onChange={(e) => handleInputChange('volume', parseFloat(e.target.value) || 0)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Es. 0.5"
          />
        </div>
      </div>

      {/* Tipo di Trasporto e Urgenza */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo di Trasporto *
          </label>
          <select
            value={formData.transportType}
            onChange={(e) => handleInputChange('transportType', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="road">🚛 Su Strada</option>
            <option value="sea">🚢 Via Mare</option>
            <option value="air">✈️ Via Aerea</option>
            <option value="rail">🚂 Via Ferrovia</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Urgenza
          </label>
          <select
            value={formData.urgency}
            onChange={(e) => handleInputChange('urgency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="standard">Standard</option>
            <option value="express">Express</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>
      </div>

      {/* Codice HS e Valore Prodotto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Codice HS (opzionale)
          </label>
          <input
            type="text"
            value={hsCodeSearch}
            onChange={(e) => setHsCodeSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Cerca prodotto (es. smartphone)"
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
            Valore Prodotto (€)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.productValue || ''}
            onChange={(e) => handleInputChange('productValue', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Es. 1000"
          />
        </div>
      </div>

      {/* Opzioni Aggiuntive */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Opzioni Aggiuntive
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.options?.insurance || false}
              onChange={(e) => handleOptionChange('insurance', e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Assicurazione</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.options?.customsClearance || false}
              onChange={(e) => handleOptionChange('customsClearance', e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Sdoganamento</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.options?.doorToDoor || false}
              onChange={(e) => handleOptionChange('doorToDoor', e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Porta a Porta</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.options?.temperatureControlled || false}
              onChange={(e) => handleOptionChange('temperatureControlled', e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Controllo Temperatura</span>
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
              Calcolando...
            </div>
          ) : (
            '🚚 Calcola Prezzo'
          )}
        </button>
      </div>
    </form>
  );
}; 