import React from 'react';
import { useTranslation } from 'react-i18next';
import { PricingResponse } from '../../types/pricing';

interface PricingResultProps {
  result: PricingResponse;
  onBack: () => void;
  onRecalculate: () => void;
}

export const PricingResult: React.FC<PricingResultProps> = ({ result, onBack, onRecalculate }) => {
  const { t, i18n } = useTranslation('common');
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(i18n.language === 'en' ? 'en-US' : 'it-IT', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header del risultato */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t('pricingResult.calculationCompleted')}
        </h2>
        <p className="text-gray-600">
          {t('pricingResult.priceCalculatedOn', { date: formatDate(result.details.validity.from) })}
        </p>
      </div>

      {/* Prezzo Totale */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="text-center">
          <p className="text-sm font-medium text-blue-600 mb-1">{t('pricingResult.totalPrice')}</p>
          <p className="text-4xl font-bold text-blue-900">
            {formatCurrency(result.price)}
          </p>
          <p className="text-sm text-blue-600 mt-1">
            {t('pricingResult.validUntil', { date: formatDate(result.details.validity.to) })}
          </p>
        </div>
      </div>

      {/* Breakdown dei Costi */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('pricingResult.costBreakdown')}
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-700">{t('pricingResult.baseTransport')}</span>
              <span className="font-medium">{formatCurrency(result.breakdown.transport)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-700">{t('pricingResult.dutiesAndTariffs')}</span>
              <span className="font-medium">{formatCurrency(result.breakdown.duties)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-700">{t('pricingResult.customsFees')}</span>
              <span className="font-medium">{formatCurrency(result.breakdown.fees)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-700">{t('pricingResult.insurance')}</span>
              <span className="font-medium">{formatCurrency(result.breakdown.insurance)}</span>
            </div>
            <div className="flex justify-between items-center py-3 bg-gray-50 rounded-lg px-4">
              <span className="font-semibold text-gray-900">{t('pricingResult.total')}</span>
              <span className="font-bold text-lg text-blue-600">{formatCurrency(result.breakdown.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dettagli Aggiuntivi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tempo di Transito */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            ⏱️ {t('pricingResult.transitTime')}
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('pricingResult.estimated')}:</span>
              <span className="font-medium">{result.details.transitTime.estimated} {t('pricingResult.days')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('pricingResult.confidence')}:</span>
              <span className="font-medium">{(result.details.transitTime.confidence * 100).toFixed(0)}%</span>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">{t('pricingResult.consideredFactors')}:</p>
              <ul className="text-xs text-gray-500 space-y-1">
                {result.details.transitTime.factors.map((factor, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Dazi Applicati */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            🏛️ {t('pricingResult.dutiesAndTariffs')}
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">{t('pricingResult.baseDuty')}:</span>
              <span className="font-medium">{formatCurrency(result.details.dutiesAndTariffs.baseDuty)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t('pricingResult.specialTariffs')}:</span>
              <span className="font-medium">{formatCurrency(result.details.dutiesAndTariffs.specialTariffs)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-gray-900">{t('pricingResult.totalDuties')}:</span>
              <span className="text-blue-600">{formatCurrency(result.details.dutiesAndTariffs.totalDuties)}</span>
            </div>
            {result.details.dutiesAndTariffs.appliedRates.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">{t('pricingResult.appliedTariffs')}:</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  {result.details.dutiesAndTariffs.appliedRates.map((rate, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-1 h-1 bg-blue-400 rounded-full mr-2"></span>
                      {rate.description} ({rate.rate}%)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Note e Informazioni */}
      {result.details.notes && result.details.notes.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-2">📝 {t('pricingResult.notes')}</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            {result.details.notes.map((note, index) => (
              <li key={index} className="flex items-start">
                <span className="w-1 h-1 bg-blue-400 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pulsanti Azione */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onBack}
          className="px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
        >
          ← {t('pricingResult.newCalculation')}
        </button>
        <button
          onClick={onRecalculate}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          🔄 {t('pricingResult.recalculate')}
        </button>
      </div>

      {/* ID Richiesta */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          {t('pricingResult.requestId', { id: result.details.requestId })}
        </p>
      </div>
    </div>
  );
}; 