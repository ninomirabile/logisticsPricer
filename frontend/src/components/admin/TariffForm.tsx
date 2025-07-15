import React, { useState, useEffect } from 'react';

interface TariffRate {
  _id: string;
  originCountry: string;
  destinationCountry: string;
  hsCode: string;
  baseRate: number;
  specialRate?: number;
  effectiveDate: string;
  expiryDate?: string;
  source: string;
  isActive: boolean;
  notes?: string;
}

interface TariffFormProps {
  tariff?: TariffRate | null;
  onSubmit: (data: Partial<TariffRate>) => void;
  onCancel: () => void;
}

export const TariffForm: React.FC<TariffFormProps> = ({ tariff, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<TariffRate>>({
    originCountry: '',
    destinationCountry: '',
    hsCode: '',
    baseRate: 0,
    specialRate: 0,
    effectiveDate: new Date().toISOString().split('T')[0],
    source: 'MANUAL',
    isActive: true,
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (tariff) {
      setFormData({
        ...tariff,
        effectiveDate: tariff.effectiveDate.split('T')[0],
        expiryDate: tariff.expiryDate?.split('T')[0] || ''
      });
    }
  }, [tariff]);

  const countries = [
    { code: 'IT', name: 'Italia' },
    { code: 'US', name: 'Stati Uniti' },
    { code: 'DE', name: 'Germania' },
    { code: 'CN', name: 'Cina' },
    { code: 'FR', name: 'Francia' },
    { code: 'GB', name: 'Regno Unito' },
    { code: 'JP', name: 'Giappone' },
    { code: 'KR', name: 'Corea del Sud' },
    { code: 'IN', name: 'India' },
    { code: 'BR', name: 'Brasile' },
    { code: 'MX', name: 'Messico' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'RU', name: 'Russia' },
    { code: 'TR', name: 'Turchia' },
    { code: 'SA', name: 'Arabia Saudita' }
  ];

  const sources = [
    { code: 'WTO', name: 'Organizzazione Mondiale del Commercio' },
    { code: 'CUSTOMS_API', name: 'API Dogane Ufficiali' },
    { code: 'MANUAL', name: 'Inserimento Manuale' },
    { code: 'TRADE_AGREEMENT', name: 'Accordo Commerciale' }
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.originCountry) {
      newErrors.originCountry = 'Paese di origine richiesto';
    }

    if (!formData.destinationCountry) {
      newErrors.destinationCountry = 'Paese di destinazione richiesto';
    }

    if (!formData.hsCode) {
      newErrors.hsCode = 'Codice HS richiesto';
    } else if (!/^\d{4}\.\d{2}\.\d{2}$/.test(formData.hsCode)) {
      newErrors.hsCode = 'Formato HS Code: XXXX.XX.XX';
    }

    if (!formData.baseRate || formData.baseRate < 0) {
      newErrors.baseRate = 'Tariffa base deve essere maggiore di 0';
    }

    if (formData.specialRate && formData.specialRate < 0) {
      newErrors.specialRate = 'Tariffa speciale deve essere maggiore di 0';
    }

    if (!formData.effectiveDate) {
      newErrors.effectiveDate = 'Data di efficacia richiesta';
    }

    if (formData.expiryDate && formData.expiryDate <= formData.effectiveDate) {
      newErrors.expiryDate = 'Data di scadenza deve essere successiva alla data di efficacia';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData = {
        ...formData,
        baseRate: Number(formData.baseRate),
        specialRate: formData.specialRate ? Number(formData.specialRate) : undefined,
        effectiveDate: formData.effectiveDate,
        expiryDate: formData.expiryDate || undefined
      };
      
      onSubmit(submitData);
    }
  };

  const handleInputChange = (field: keyof TariffRate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {tariff ? 'Modifica Tariffa' : 'Nuova Tariffa'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Countries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paese di Origine *
                </label>
                <select
                  value={formData.originCountry}
                  onChange={(e) => handleInputChange('originCountry', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.originCountry ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleziona paese</option>
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.code} - {country.name}
                    </option>
                  ))}
                </select>
                {errors.originCountry && (
                  <p className="mt-1 text-sm text-red-600">{errors.originCountry}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paese di Destinazione *
                </label>
                <select
                  value={formData.destinationCountry}
                  onChange={(e) => handleInputChange('destinationCountry', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.destinationCountry ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleziona paese</option>
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.code} - {country.name}
                    </option>
                  ))}
                </select>
                {errors.destinationCountry && (
                  <p className="mt-1 text-sm text-red-600">{errors.destinationCountry}</p>
                )}
              </div>
            </div>

            {/* HS Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Codice HS *
              </label>
              <input
                type="text"
                placeholder="es. 8471.30.01"
                value={formData.hsCode}
                onChange={(e) => handleInputChange('hsCode', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.hsCode ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.hsCode && (
                <p className="mt-1 text-sm text-red-600">{errors.hsCode}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Formato: XXXX.XX.XX (es. 8471.30.01 per computer)
              </p>
            </div>

            {/* Rates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tariffa Base (%) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.baseRate}
                  onChange={(e) => handleInputChange('baseRate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.baseRate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.baseRate && (
                  <p className="mt-1 text-sm text-red-600">{errors.baseRate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tariffa Speciale (%) (opzionale)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.specialRate || ''}
                  onChange={(e) => handleInputChange('specialRate', e.target.value || undefined)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.specialRate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.specialRate && (
                  <p className="mt-1 text-sm text-red-600">{errors.specialRate}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Per tariffe anti-dumping o speciali
                </p>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data di Efficacia *
                </label>
                <input
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.effectiveDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.effectiveDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.effectiveDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data di Scadenza (opzionale)
                </label>
                <input
                  type="date"
                  value={formData.expiryDate || ''}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value || undefined)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.expiryDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
                )}
              </div>
            </div>

            {/* Source and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fonte *
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => handleInputChange('source', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {sources.map(source => (
                    <option key={source.code} value={source.code}>
                      {source.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stato
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Tariffa attiva
                  </label>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note (opzionale)
              </label>
              <textarea
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Descrizione della tariffa, note speciali..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                {tariff ? 'Aggiorna' : 'Crea'} Tariffa
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 