import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { pricingService, PricingStats } from '../../services/pricingService';

export const PricingStatsComponent: React.FC = () => {
  const { t } = useTranslation('admin');
  const [stats, setStats] = useState<PricingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pricingService.getPricingStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento delle statistiche');
      console.error('Error loading pricing stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-500 py-8">
        {t('pricingStats.noStatsAvailable')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        {t('pricingStats.statsTitle')}
      </h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('pricingStats.totalRequests')}</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.overview.totalRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('pricingStats.pendingRequests')}</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.overview.pendingRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('pricingStats.calculatedRequests')}</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.overview.calculatedRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t('pricingStats.expiredRequests')}</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.overview.expiredRequests}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transport Types Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('pricingStats.transportDistribution')}</h3>
        <div className="space-y-3">
          {stats.transportTypes.map((item) => (
            <div key={item.type} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 capitalize">{item.type}</span>
              </div>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full" 
                    style={{ 
                      width: `${(item.count / stats.overview.totalRequests) * 100}%` 
                    }}
                  ></div>
                </div>
                <span className="text-sm text-gray-500 w-8 text-right">{item.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Countries */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('pricingStats.topCountries')}</h3>
        <div className="space-y-3">
          {stats.topCountries.slice(0, 5).map((item, index) => (
            <div key={item.country} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 w-6">#{index + 1}</span>
                <span className="text-sm text-gray-700">{item.country}</span>
              </div>
              <span className="text-sm text-gray-500">{item.count} {t('pricingStats.requests')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Averages */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('pricingStats.averages')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">{t('pricingStats.avgCargoValue')}</p>
            <p className="text-2xl font-semibold text-gray-900">€{stats.averages.avgCargoValue.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">{t('pricingStats.avgWeight')}</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.averages.avgWeight.toFixed(1)} {t('pricingStats.kg')}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">{t('pricingStats.avgVolume')}</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.averages.avgVolume.toFixed(2)} {t('pricingStats.m3')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}; 