import React, { useState, useEffect } from 'react';
import { shippingService, ShippingRouteStats } from '../../services/shippingService';

export const ShippingRouteStatsComponent: React.FC = () => {
  const [stats, setStats] = useState<ShippingRouteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await shippingService.getShippingRouteStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento delle statistiche');
      console.error('Error loading shipping route stats:', err);
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
        Nessuna statistica disponibile
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Statistiche Rotte di Trasporto
      </h2>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Totale Rotte</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.overview.totalRoutes}</p>
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
              <p className="text-sm font-medium text-gray-500">Rotte Attive</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.overview.activeRoutes}</p>
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
              <p className="text-sm font-medium text-gray-500">Tempo Medio Transito</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.overview.avgTransitTime.toFixed(1)} giorni</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ritardo Medio Dogana</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.overview.avgCustomsDelay.toFixed(1)} giorni</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transport Types Chart */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Distribuzione per Tipo di Trasporto</h3>
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
                      width: `${(item.count / stats.overview.totalRoutes) * 100}%` 
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Paesi di Origine</h3>
        <div className="space-y-3">
          {stats.topCountries.slice(0, 5).map((item, index) => (
            <div key={item.country} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 w-6">#{index + 1}</span>
                <span className="text-sm text-gray-700">{item.country}</span>
              </div>
              <span className="text-sm text-gray-500">{item.count} rotte</span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Metriche di Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">Efficienza Tempi</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tempo medio transito</span>
                <span className="text-sm font-medium">{stats.overview.avgTransitTime.toFixed(1)} giorni</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Ritardo medio dogana</span>
                <span className="text-sm font-medium">{stats.overview.avgCustomsDelay.toFixed(1)} giorni</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Efficienza</span>
                <span className="text-sm font-medium">
                  {stats.overview.totalRoutes > 0 ? 
                    ((stats.overview.activeRoutes / stats.overview.totalRoutes) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">Copertura</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Rotte attive</span>
                <span className="text-sm font-medium">{stats.overview.activeRoutes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Rotte inattive</span>
                <span className="text-sm font-medium">{stats.overview.totalRoutes - stats.overview.activeRoutes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tipi trasporto</span>
                <span className="text-sm font-medium">{stats.transportTypes.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 