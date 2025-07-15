import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { TariffForm } from './TariffForm';
import { tariffService, TariffRate, TariffFilters } from '../../services/tariffService';

export const TariffManagement: React.FC = () => {
  const { t } = useTranslation('admin');
  const [tariffs, setTariffs] = useState<TariffRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTariff, setEditingTariff] = useState<TariffRate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Load tariffs from API
  const loadTariffs = useCallback(async (filters: TariffFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const filterParams: TariffFilters = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      if (searchTerm) filterParams.search = searchTerm;
      if (filterCountry) filterParams.originCountry = filterCountry;
      if (filterSource) filterParams.source = filterSource;
      
      const response = await tariffService.getTariffs(filterParams);
      
      setTariffs(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento delle tariffe');
      console.error('Error loading tariffs:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, filterCountry, filterSource]);

  // Initial load
  useEffect(() => {
    loadTariffs();
  }, [loadTariffs]);

  // Reload when filters change
  useEffect(() => {
    if (searchTerm || filterCountry || filterSource) {
      loadTariffs();
    }
  }, [searchTerm, filterCountry, filterSource, loadTariffs]);

  const filteredTariffs = tariffs.filter(tariff => {
    const matchesSearch = 
      tariff.hsCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tariff.originCountry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tariff.destinationCountry.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCountry = !filterCountry || 
      tariff.originCountry === filterCountry || 
      tariff.destinationCountry === filterCountry;
    
    const matchesSource = !filterSource || tariff.source === filterSource;
    
    return matchesSearch && matchesCountry && matchesSource;
  });

  const handleEdit = (tariff: TariffRate) => {
    setEditingTariff(tariff);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa tariffa?')) {
      try {
        await tariffService.deleteTariff(id);
        setTariffs(tariffs.filter(t => t._id !== id));
        // Reload to update pagination
        loadTariffs();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore nell\'eliminazione della tariffa');
        console.error('Error deleting tariff:', err);
      }
    }
  };

  const handleFormSubmit = async (tariffData: Partial<TariffRate>) => {
    try {
      if (editingTariff) {
        // Update existing tariff
        const updatedTariff = await tariffService.updateTariff(editingTariff._id, tariffData);
        setTariffs(tariffs.map(t => 
          t._id === editingTariff._id ? updatedTariff : t
        ));
        setEditingTariff(null);
      } else {
        // Add new tariff
        const newTariff = await tariffService.createTariff(tariffData as Omit<TariffRate, '_id' | 'createdAt' | 'updatedAt'>);
        setTariffs([newTariff, ...tariffs]);
      }
      setShowForm(false);
      // Reload to update pagination
      loadTariffs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel salvataggio della tariffa');
      console.error('Error saving tariff:', err);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    loadTariffs({ page: newPage });
  };

  const countries = tariffService.getAvailableCountries();
  const sources = tariffService.getAvailableSources();

  if (loading && tariffs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {t('tariffManagement.title')}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          {t('tariffManagement.addTariffButton')}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('tariffManagement.searchLabel')}
            </label>
            <input
              type="text"
              placeholder={t('tariffManagement.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('tariffManagement.countryLabel')}
            </label>
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{t('tariffManagement.allCountries')}</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('tariffManagement.sourceLabel')}
            </label>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{t('tariffManagement.allSources')}</option>
              {sources.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCountry('');
                setFilterSource('');
              }}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              {t('tariffManagement.resetFiltersButton')}
            </button>
          </div>
        </div>
      </div>

      {/* Tariffs Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('tariffManagement.hsCodeHeader')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('tariffManagement.originDestinationHeader')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('tariffManagement.baseRateHeader')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('tariffManagement.specialRateHeader')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('tariffManagement.sourceHeader')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('tariffManagement.statusHeader')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('tariffManagement.actionsHeader')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTariffs.map((tariff) => (
                <tr key={tariff._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tariff.hsCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tariff.originCountry} → {tariff.destinationCountry}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tariff.baseRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tariff.specialRate ? `${tariff.specialRate}%` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      tariff.source === 'WTO' ? 'bg-blue-100 text-blue-800' :
                      tariff.source === 'TRADE_AGREEMENT' ? 'bg-green-100 text-green-800' :
                      tariff.source === 'CUSTOMS_API' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {tariff.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      tariff.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tariff.isActive ? t('tariffManagement.activeStatus') : t('tariffManagement.inactiveStatus')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(tariff)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      {t('tariffManagement.editAction')}
                    </button>
                    <button
                      onClick={() => handleDelete(tariff._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      {t('tariffManagement.deleteAction')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {t('tariffManagement.previousPage')}
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {t('tariffManagement.nextPage')}
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  {t('tariffManagement.showingResults', {
                    start: (pagination.page - 1) * pagination.limit + 1,
                    end: Math.min(pagination.page * pagination.limit, pagination.total),
                    total: pagination.total
                  })}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.page
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <TariffForm
          tariff={editingTariff}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingTariff(null);
          }}
        />
      )}
    </div>
  );
}; 