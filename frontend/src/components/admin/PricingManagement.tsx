import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { pricingService, PricingRequest, PricingFilters } from '../../services/pricingService';

export const PricingManagement: React.FC = () => {
  const { t } = useTranslation('admin');
  const [requests, setRequests] = useState<PricingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState<PricingRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTransportType, setFilterTransportType] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Load pricing requests from API
  const loadRequests = useCallback(async (filters: PricingFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const filterParams: PricingFilters = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      if (searchTerm) filterParams.search = searchTerm;
      if (filterStatus) filterParams.status = filterStatus;
      if (filterTransportType) filterParams.transportType = filterTransportType;
      
      const response = await pricingService.getPricingRequests(filterParams);
      
      setRequests(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento delle richieste di pricing');
      console.error('Error loading pricing requests:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, filterStatus, filterTransportType]);

  // Initial load
  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Reload when filters change
  useEffect(() => {
    if (searchTerm || filterStatus || filterTransportType) {
      loadRequests();
    }
  }, [searchTerm, filterStatus, filterTransportType, loadRequests]);

  const handleEdit = (request: PricingRequest) => {
    setEditingRequest(request);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa richiesta di pricing?')) {
      try {
        await pricingService.deletePricingRequest(id);
        setRequests(requests.filter(r => r._id !== id));
        // Reload to update pagination
        loadRequests();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore nell\'eliminazione della richiesta');
        console.error('Error deleting pricing request:', err);
      }
    }
  };

  const handleFormSubmit = async (requestData: Partial<PricingRequest>) => {
    try {
      if (editingRequest) {
        // Update existing request
        const updatedRequest = await pricingService.updatePricingRequest(editingRequest._id!, requestData);
        setRequests(requests.map(r => 
          r._id === editingRequest._id ? updatedRequest : r
        ));
        setEditingRequest(null);
      } else {
        // Add new request
        const newRequest = await pricingService.createPricingRequest(requestData as Omit<PricingRequest, '_id' | 'createdAt' | 'updatedAt'>);
        setRequests([newRequest, ...requests]);
      }
      setShowForm(false);
      // Reload to update pagination
      loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel salvataggio della richiesta');
      console.error('Error saving pricing request:', err);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    loadRequests({ page: newPage });
  };

  const transportTypes = pricingService.getAvailableTransportTypes();

  if (loading && requests.length === 0) {
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
          {t('pricingManagement.title')}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          {t('pricingManagement.addRequestButton')}
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
              {t('pricingManagement.searchLabel')}
            </label>
            <input
              type="text"
              placeholder={t('pricingManagement.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('pricingManagement.statusLabel')}
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{t('pricingManagement.allStatuses')}</option>
              <option value="pending">{t('pricingManagement.pendingStatus')}</option>
              <option value="calculated">{t('pricingManagement.calculatedStatus')}</option>
              <option value="expired">{t('pricingManagement.expiredStatus')}</option>
              <option value="cancelled">{t('pricingManagement.cancelledStatus')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('pricingManagement.transportTypeLabel')}
            </label>
            <select
              value={filterTransportType}
              onChange={(e) => setFilterTransportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{t('pricingManagement.allTransportTypes')}</option>
              {transportTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('');
                setFilterTransportType('');
              }}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              {t('pricingManagement.resetFiltersButton')}
            </button>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('pricingManagement.originDestinationHeader')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('pricingManagement.productHeader')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('pricingManagement.weightVolumeHeader')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('pricingManagement.transportHeader')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('pricingManagement.valueHeader')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('pricingManagement.statusHeader')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('pricingManagement.actionsHeader')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{request.origin.city}, {request.origin.country}</div>
                      <div className="text-gray-500">→ {request.destination.city}, {request.destination.country}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div className="font-medium">{request.cargo.productDescription}</div>
                      <div className="text-gray-400">{request.cargo.hsCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>{request.cargo.weight} kg</div>
                      <div className="text-gray-400">{request.cargo.volume} m³</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div className="font-medium">{request.transport.type}</div>
                      <div className="text-gray-400">{request.transport.urgency}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    €{request.cargo.value.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      request.status === 'calculated' ? 'bg-green-100 text-green-800' :
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      request.status === 'expired' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status === 'calculated' ? t('pricingManagement.calculatedStatus') :
                       request.status === 'pending' ? t('pricingManagement.pendingStatus') :
                       request.status === 'expired' ? t('pricingManagement.expiredStatus') :
                       request.status === 'cancelled' ? t('pricingManagement.cancelledStatus') : request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(request)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      {t('pricingManagement.editAction')}
                    </button>
                    <button
                      onClick={() => handleDelete(request._id!)}
                      className="text-red-600 hover:text-red-900"
                    >
                      {t('pricingManagement.deleteAction')}
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
                {t('pricingManagement.previousPage')}
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                {t('pricingManagement.nextPage')}
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  {t('pricingManagement.showingResults', {
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
        <PricingForm
          request={editingRequest}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingRequest(null);
          }}
        />
      )}
    </div>
  );
};

// Pricing Form Component
interface PricingFormProps {
  request?: PricingRequest | null;
  onSubmit: (data: Partial<PricingRequest>) => void;
  onCancel: () => void;
}

const PricingForm: React.FC<PricingFormProps> = ({ request, onSubmit, onCancel }) => {
  const { t } = useTranslation('admin');
  const transportTypes = pricingService.getAvailableTransportTypes();
  const countries = pricingService.getAvailableCountries();
  const [formData, setFormData] = useState<Partial<PricingRequest>>({
    origin: { city: '', country: '' },
    destination: { city: '', country: '' },
    cargo: {
      productDescription: '',
      hsCode: '',
      weight: 0,
      volume: 0,
      value: 0,
      quantity: 1,
      dimensions: {
        length: 1,
        width: 1,
        height: 1
      }
    },
    transport: {
      type: 'road',
      urgency: 'standard',
      specialRequirements: []
    },
    options: {
      insurance: false,
      customsClearance: false,
      doorToDoor: false,
      temperatureControlled: false
    },
    status: 'pending'
  });

  useEffect(() => {
    if (request) {
      const requestData: Partial<PricingRequest> = {
        origin: request.origin,
        destination: request.destination,
        cargo: request.cargo,
        transport: request.transport
      };
      
      if (request._id) requestData._id = request._id;
      if (request.status) requestData.status = request.status;
      if (request.notes) requestData.notes = request.notes;
      
      setFormData(requestData);
    }
  }, [request]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {request ? t('pricingManagement.editRequestTitle') : t('pricingManagement.newRequestTitle')}
            </h3>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Origin and Destination */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('pricingManagement.originCountryLabel')}
                </label>
                <select
                  value={formData.origin?.country || ''}
                  onChange={(e) => setFormData({
                    ...formData, 
                    origin: {
                      country: e.target.value,
                      city: formData.origin?.city || '',
                      ...(formData.origin?.coordinates && { coordinates: formData.origin.coordinates })
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">{t('pricingManagement.selectCountry')}</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('pricingManagement.destinationCountryLabel')}
                </label>
                <select
                  value={formData.destination?.country || ''}
                  onChange={(e) => setFormData({
                    ...formData, 
                    destination: {
                      country: e.target.value,
                      city: formData.destination?.city || '',
                      ...(formData.destination?.coordinates && { coordinates: formData.destination.coordinates })
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">{t('pricingManagement.selectCountry')}</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('pricingManagement.originCityLabel')}
                </label>
                <select
                  value={formData.origin?.city || ''}
                  onChange={(e) => setFormData({
                    ...formData, 
                    origin: {
                      country: formData.origin?.country || '',
                      city: e.target.value,
                      ...(formData.origin?.coordinates && { coordinates: formData.origin.coordinates })
                    }
                  })}
                  disabled={!formData.origin?.country}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                >
                  <option value="">{t('pricingManagement.selectCity')}</option>
                  {formData.origin?.country && pricingService.getAvailableCities(formData.origin.country).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('pricingManagement.destinationCityLabel')}
                </label>
                <select
                  value={formData.destination?.city || ''}
                  onChange={(e) => setFormData({
                    ...formData, 
                    destination: {
                      country: formData.destination?.country || '',
                      city: e.target.value,
                      ...(formData.destination?.coordinates && { coordinates: formData.destination.coordinates })
                    }
                  })}
                  disabled={!formData.destination?.country}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                >
                  <option value="">{t('pricingManagement.selectCity')}</option>
                  {formData.destination?.country && pricingService.getAvailableCities(formData.destination.country).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cargo Details */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">{t('pricingManagement.cargoDetailsTitle')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pricingManagement.productDescriptionLabel')}
                  </label>
                  <input
                    type="text"
                    value={formData.cargo?.productDescription || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      cargo: {
                        ...formData.cargo!,
                        productDescription: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pricingManagement.hsCodeLabel')}
                  </label>
                  <input
                    type="text"
                    value={formData.cargo?.hsCode || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      cargo: {
                        ...formData.cargo!,
                        hsCode: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pricingManagement.weightLabel')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cargo?.weight || 0}
                    onChange={(e) => setFormData({
                      ...formData, 
                      cargo: {
                        ...formData.cargo!,
                        weight: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pricingManagement.volumeLabel')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cargo?.volume || 0}
                    onChange={(e) => setFormData({
                      ...formData, 
                      cargo: {
                        ...formData.cargo!,
                        volume: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pricingManagement.valueLabel')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.cargo?.value || 0}
                    onChange={(e) => setFormData({
                      ...formData, 
                      cargo: {
                        ...formData.cargo!,
                        value: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Transport Details */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">{t('pricingManagement.transportDetailsTitle')}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pricingManagement.transportTypeLabel')}
                  </label>
                  <select
                    value={formData.transport?.type || 'road'}
                    onChange={(e) => setFormData({
                      ...formData, 
                      transport: {
                        ...formData.transport!,
                        type: e.target.value as 'road' | 'air' | 'sea' | 'rail' | 'multimodal'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {transportTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pricingManagement.urgencyLabel')}
                  </label>
                  <select
                    value={formData.transport?.urgency || 'standard'}
                    onChange={(e) => setFormData({
                      ...formData, 
                      transport: {
                        ...formData.transport!,
                        urgency: e.target.value as 'standard' | 'express' | 'urgent'
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="standard">{t('pricingManagement.standardUrgency')}</option>
                    <option value="express">{t('pricingManagement.expressUrgency')}</option>
                    <option value="urgent">{t('pricingManagement.urgentUrgency')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Status and Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('pricingManagement.statusLabel')}
                </label>
                <select
                  value={formData.status || 'pending'}
                  onChange={(e) => setFormData({
                    ...formData, 
                    status: e.target.value as 'pending' | 'calculated' | 'expired' | 'cancelled'
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="pending">{t('pricingManagement.pendingStatus')}</option>
                  <option value="calculated">{t('pricingManagement.calculatedStatus')}</option>
                  <option value="expired">{t('pricingManagement.expiredStatus')}</option>
                  <option value="cancelled">{t('pricingManagement.cancelledStatus')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('pricingManagement.notesLabel')}
                </label>
                <textarea
                  rows={3}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder={t('pricingManagement.notesPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                {t('pricingManagement.cancelButton')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                {request ? t('pricingManagement.updateRequestButton') : t('pricingManagement.createRequestButton')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 