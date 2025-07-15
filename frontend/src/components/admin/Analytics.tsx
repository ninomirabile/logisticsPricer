import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface AnalyticsData {
  totalCalculations: number;
  calculationsToday: number;
  averageCost: number;
  topRoutes: Array<{
    origin: string;
    destination: string;
    count: number;
    averageCost: number;
  }>;
  transportTypeBreakdown: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  costTrends: Array<{
    date: string;
    averageCost: number;
    count: number;
  }>;
  topHSCodes: Array<{
    hsCode: string;
    description: string;
    count: number;
    averageDuty: number;
  }>;
}

export const Analytics: React.FC = () => {
  const { t } = useTranslation('admin');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  // Mock data - in real app this would come from API
  useEffect(() => {
    const mockData: AnalyticsData = {
      totalCalculations: 15420,
      calculationsToday: 342,
      averageCost: 1250.50,
      topRoutes: [
        { origin: 'IT', destination: 'US', count: 1250, averageCost: 1800.00 },
        { origin: 'DE', destination: 'US', count: 980, averageCost: 1650.00 },
        { origin: 'CN', destination: 'US', count: 890, averageCost: 2200.00 },
        { origin: 'IT', destination: 'DE', count: 750, averageCost: 450.00 },
        { origin: 'FR', destination: 'US', count: 620, averageCost: 1750.00 }
      ],
      transportTypeBreakdown: [
        { type: 'Air', count: 5200, percentage: 33.7 },
        { type: 'Sea', count: 4800, percentage: 31.1 },
        { type: 'Road', count: 4200, percentage: 27.2 },
        { type: 'Rail', count: 1220, percentage: 7.9 }
      ],
      costTrends: [
        { date: '2024-01-01', averageCost: 1200, count: 150 },
        { date: '2024-01-02', averageCost: 1250, count: 165 },
        { date: '2024-01-03', averageCost: 1180, count: 140 },
        { date: '2024-01-04', averageCost: 1320, count: 180 },
        { date: '2024-01-05', averageCost: 1280, count: 175 },
        { date: '2024-01-06', averageCost: 1350, count: 190 },
        { date: '2024-01-07', averageCost: 1250, count: 342 }
      ],
      topHSCodes: [
        { hsCode: '8471.30.01', description: 'Computer portatili', count: 450, averageDuty: 5.5 },
        { hsCode: '8517.13.00', description: 'Smartphone', count: 380, averageDuty: 15.0 },
        { hsCode: '8708.99.80', description: 'Parti auto', count: 320, averageDuty: 3.2 },
        { hsCode: '9503.00.00', description: 'Giochi', count: 280, averageDuty: 2.8 },
        { hsCode: '8528.72.00', description: 'TV LCD', count: 250, averageDuty: 4.5 }
      ]
    };
    
    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          📊 {t('analytics.title')}
        </h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="7d">{t('analytics.last7Days')}</option>
          <option value="30d">{t('analytics.last30Days')}</option>
          <option value="90d">{t('analytics.last90Days')}</option>
          <option value="1y">{t('analytics.lastYear')}</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('analytics.totalCalculations')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {data.totalCalculations.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('analytics.today')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {data.calculationsToday}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('analytics.averageCost')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                €{data.averageCost.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">🚚</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('analytics.activeRoutes')}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {data.topRoutes.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Transport Type Breakdown */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('analytics.transportTypeBreakdown')}
          </h3>
          <div className="space-y-4">
            {data.transportTypeBreakdown.map((item) => (
              <div key={item.type} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded-full bg-indigo-500 mr-3"></div>
                  <span className="text-sm font-medium text-gray-900">{item.type}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-16 text-right">
                    {item.percentage}%
                  </span>
                  <span className="text-sm text-gray-600 w-16 text-right">
                    {item.count.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Routes */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('analytics.top5Routes')}
          </h3>
          <div className="space-y-3">
            {data.topRoutes.map((route, index) => (
              <div key={`${route.origin}-${route.destination}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {route.origin} → {route.destination}
                    </p>
                    <p className="text-xs text-gray-500">
                      {route.count.toLocaleString()} {t('analytics.shipments')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    €{route.averageCost.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">{t('analytics.averageCost')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost Trends */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('analytics.costTrends')}
          </h3>
          <div className="space-y-3">
            {data.costTrends.map((trend) => (
              <div key={trend.date} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {new Date(trend.date).toLocaleDateString('it-IT', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-900">
                    €{trend.averageCost.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({trend.count} {t('analytics.calculations')})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top HS Codes */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {t('analytics.topHSCodes')}
          </h3>
          <div className="space-y-3">
            {data.topHSCodes.map((hsCode, index) => (
              <div key={hsCode.hsCode} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {hsCode.hsCode}
                    </p>
                    <p className="text-xs text-gray-500">
                      {hsCode.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {hsCode.averageDuty}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {hsCode.count} {t('analytics.uses')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          📤 {t('analytics.exportReport')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <span className="mr-2">📊</span>
            {t('analytics.completeReportPDF')}
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <span className="mr-2">📈</span>
            {t('analytics.analyticsDataCSV')}
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <span className="mr-2">💰</span>
            {t('analytics.tariffReportExcel')}
          </button>
        </div>
      </div>

      {/* Coming Soon Features */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-2xl">🚀</span>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-blue-900">
              {t('analytics.advancedAnalyticsInDevelopment')}
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>{t('analytics.upcomingFeatures')}:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>{t('analytics.interactiveCharts')}</li>
                <li>{t('analytics.mlCostPredictions')}</li>
                <li>{t('analytics.seasonalAnalysis')}</li>
                <li>{t('analytics.customizableDashboards')}</li>
                <li>{t('analytics.automaticReports')}</li>
                <li>{t('analytics.externalSystemIntegration')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 