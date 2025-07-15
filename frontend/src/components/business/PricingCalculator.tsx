import React, { useState } from 'react';
import { PricingForm } from './PricingForm';
import { PricingResult } from './PricingResult';
import { PricingRequest, PricingResponse } from '../../types/pricing';
import { pricingService } from '../../services/pricingService';

export const PricingCalculator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PricingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = async (request: PricingRequest) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await pricingService.calculatePrice(request as unknown as Record<string, unknown>);
      // Convert the service response to the expected type
      const convertedResult: PricingResponse = {
        success: response.success,
        price: response.price,
        breakdown: response.breakdown,
        details: response.details
      };
      setResult(convertedResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante il calcolo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">
            🚚 LogisticsPricer - Calcolo Prezzi Trasporto
          </h1>
          <p className="text-blue-100 mt-1">
            Calcola il costo completo del trasporto merci con dazi e tariffe
          </p>
        </div>

        <div className="p-6">
          {!result ? (
            <PricingForm onSubmit={handleCalculate} isLoading={isLoading} />
          ) : (
            <PricingResult 
              result={result} 
              onBack={handleReset}
              onRecalculate={handleReset}
            />
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Errore durante il calcolo
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 