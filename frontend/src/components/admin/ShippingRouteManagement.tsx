import React, { useState, useEffect, useCallback } from 'react';
import { shippingService, ShippingRoute, ShippingRouteFilters } from '../../services/shippingService';

export const ShippingRouteManagement: React.FC = () => {
  const [routes, setRoutes] = useState<ShippingRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRoute, setEditingRoute] = useState<ShippingRoute | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOriginCountry, setFilterOriginCountry] = useState('');
  const [filterDestinationCountry, setFilterDestinationCountry] = useState('');
  const [filterTransportType, setFilterTransportType] = useState('');
  const [filterIsActive, setFilterIsActive] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Load shipping routes from API
  const loadRoutes = useCallback(async (filters: ShippingRouteFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const filterParams: ShippingRouteFilters = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      if (searchTerm) filterParams.search = searchTerm;
      if (filterOriginCountry) filterParams.originCountry = filterOriginCountry;
      if (filterDestinationCountry) filterParams.destinationCountry = filterDestinationCountry;
      if (filterTransportType) filterParams.transportType = filterTransportType;
      if (filterIsActive) filterParams.isActive = filterIsActive === 'true';
      
      const response = await shippingService.getShippingRoutes(filterParams);
      
      setRoutes(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel caricamento delle rotte di trasporto');
      console.error('Error loading shipping routes:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, filterOriginCountry, filterDestinationCountry, filterTransportType, filterIsActive]);

  // Initial load
  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  // Reload when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadRoutes();
    }, 500); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterOriginCountry, filterDestinationCountry, filterTransportType, filterIsActive, loadRoutes]);

  const handleEdit = (route: ShippingRoute) => {
    setEditingRoute(route);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa rotta di trasporto?')) {
      try {
        await shippingService.deleteShippingRoute(id);
        setRoutes(routes.filter(r => r._id !== id));
        // Reload to update pagination
        loadRoutes();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore nell\'eliminazione della rotta');
        console.error('Error deleting shipping route:', err);
      }
    }
  };

  const handleFormSubmit = async (routeData: Partial<ShippingRoute>) => {
    try {
      if (editingRoute) {
        // Update existing route
        const updatedRoute = await shippingService.updateShippingRoute(editingRoute._id!, routeData);
        setRoutes(routes.map(r => 
          r._id === editingRoute._id ? updatedRoute : r
        ));
        setEditingRoute(null);
      } else {
        // Add new route
        const newRoute = await shippingService.createShippingRoute(routeData as Omit<ShippingRoute, '_id' | 'createdAt' | 'updatedAt'>);
        setRoutes([newRoute, ...routes]);
      }
      setShowForm(false);
      // Reload to update pagination
      loadRoutes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel salvataggio della rotta');
      console.error('Error saving shipping route:', err);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    loadRoutes({ page: newPage });
  };

  const transportTypes = shippingService.getAvailableTransportTypes();
  const countries = shippingService.getAvailableCountries();

  if (loading && routes.length === 0) {
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
          Gestione Rotte di Trasporto
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          ➕ Nuova Rotta
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
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ricerca
            </label>
            <input
              type="text"
              placeholder="Route ID, note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paese Origine
            </label>
            <select
              value={filterOriginCountry}
              onChange={(e) => setFilterOriginCountry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tutti i paesi</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paese Destinazione
            </label>
            <select
              value={filterDestinationCountry}
              onChange={(e) => setFilterDestinationCountry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tutti i paesi</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo Trasporto
            </label>
            <select
              value={filterTransportType}
              onChange={(e) => setFilterTransportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tutti i tipi</option>
              {transportTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stato
            </label>
            <select
              value={filterIsActive}
              onChange={(e) => setFilterIsActive(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tutti</option>
              <option value="true">Attive</option>
              <option value="false">Inattive</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterOriginCountry('');
                setFilterDestinationCountry('');
                setFilterTransportType('');
                setFilterIsActive('');
              }}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              🔄 Reset Filtri
            </button>
          </div>
        </div>
      </div>

      {/* Routes Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Origine → Destinazione
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trasporto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tempi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Costi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {routes.map((route) => (
                <tr key={route._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {route.routeId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{route.originCountry}</div>
                      <div className="text-gray-500">→ {route.destinationCountry}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="capitalize">{route.transportType}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>Base: {route.baseTransitTime} giorni</div>
                      <div className="text-gray-400">Totale: {route.totalTransitTime} giorni</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    €{route.totalCost?.toLocaleString() || '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      route.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {route.isActive ? 'Attiva' : 'Inattiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(route)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      ✏️ Modifica
                    </button>
                    <button
                      onClick={() => handleDelete(route._id!)}
                      className="text-red-600 hover:text-red-900"
                    >
                      🗑️ Elimina
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
                Precedente
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Successiva
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> a{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  di <span className="font-medium">{pagination.total}</span> risultati
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
        <ShippingRouteForm
          route={editingRoute}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingRoute(null);
          }}
        />
      )}
    </div>
  );
};

// Shipping Route Form Component
interface ShippingRouteFormProps {
  route?: ShippingRoute | null;
  onSubmit: (data: Partial<ShippingRoute>) => void;
  onCancel: () => void;
}

const ShippingRouteForm: React.FC<ShippingRouteFormProps> = ({ route, onSubmit, onCancel }) => {
  const transportTypes = shippingService.getAvailableTransportTypes();
  const countries = shippingService.getAvailableCountries();
  
  const [formData, setFormData] = useState<Partial<ShippingRoute>>((() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      routeId: '',
      originCountry: '',
      destinationCountry: '',
      transportType: 'road',
      baseTransitTime: 0,
      customsDelay: 0,
      portCongestion: 0,
      restrictions: [],
      requirements: {
        documents: [],
        specialHandling: [],
        certifications: []
      },
      costs: {
        baseCost: 0,
        customsFees: 0,
        portFees: 0,
        additionalFees: 0
      },
      isActive: true,
      effectiveDate: today,
      expiryDate: '',
      source: ''
    } as Partial<ShippingRoute>;
  })());

  useEffect(() => {
    if (route) {
      const today = new Date().toISOString().split('T')[0];
      const routeData: Partial<ShippingRoute> = {
        routeId: route.routeId,
        originCountry: route.originCountry,
        destinationCountry: route.destinationCountry,
        transportType: route.transportType,
        baseTransitTime: route.baseTransitTime,
        customsDelay: route.customsDelay,
        portCongestion: route.portCongestion,
        restrictions: route.restrictions,
        requirements: route.requirements,
        costs: route.costs,
        isActive: route.isActive,
        effectiveDate: ((route.effectiveDate && route.effectiveDate.split('T')[0]) || today) as string,
        source: route.source
      };
      
      if (route._id) routeData._id = route._id;
      if (route.notes) routeData.notes = route.notes;
      if (route.expiryDate && route.expiryDate.length > 0) {
        const expiryDateString = route.expiryDate.split('T')[0];
        if (expiryDateString) routeData.expiryDate = expiryDateString as string;
      }
      
      setFormData(routeData);
    }
  }, [route]);

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
              {route ? 'Modifica Rotta di Trasporto' : 'Nuova Rotta di Trasporto'}
            </h3>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Route ID *
                </label>
                <input
                  type="text"
                  value={formData.routeId || ''}
                  onChange={(e) => setFormData({...formData, routeId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fonte *
                </label>
                <input
                  type="text"
                  value={formData.source || ''}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Origin and Destination */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paese Origine *
                </label>
                <select
                  value={formData.originCountry || ''}
                  onChange={(e) => setFormData({...formData, originCountry: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Seleziona paese</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paese Destinazione *
                </label>
                <select
                  value={formData.destinationCountry || ''}
                  onChange={(e) => setFormData({...formData, destinationCountry: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Seleziona paese</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo Trasporto *
                </label>
                <select
                  value={formData.transportType || 'road'}
                  onChange={(e) => setFormData({...formData, transportType: e.target.value as 'road' | 'air' | 'sea' | 'rail' | 'multimodal'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {transportTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Transit Times */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Tempi di Transito (giorni)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tempo Base *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.baseTransitTime || 0}
                    onChange={(e) => setFormData({...formData, baseTransitTime: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ritardo Dogana
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.customsDelay || 0}
                    onChange={(e) => setFormData({...formData, customsDelay: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Congestione Porto
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.portCongestion || 0}
                    onChange={(e) => setFormData({...formData, portCongestion: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Costs */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Costi (€)</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Costo Base
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.costs?.baseCost || 0}
                    onChange={(e) => setFormData({
                      ...formData, 
                      costs: {
                        ...formData.costs!,
                        baseCost: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tasse Dogana
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.costs?.customsFees || 0}
                    onChange={(e) => setFormData({
                      ...formData, 
                      costs: {
                        ...formData.costs!,
                        customsFees: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tasse Porto
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.costs?.portFees || 0}
                    onChange={(e) => setFormData({
                      ...formData, 
                      costs: {
                        ...formData.costs!,
                        portFees: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Costi Aggiuntivi
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.costs?.additionalFees || 0}
                    onChange={(e) => setFormData({
                      ...formData, 
                      costs: {
                        ...formData.costs!,
                        additionalFees: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Status and Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stato
                </label>
                <select
                  value={formData.isActive ? 'true' : 'false'}
                  onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="true">Attiva</option>
                  <option value="false">Inattiva</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Effettiva *
                </label>
                <input
                  type="date"
                  value={formData.effectiveDate || ''}
                  onChange={(e) => setFormData({...formData, effectiveDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Scadenza
                </label>
                <input
                  type="date"
                  value={formData.expiryDate || ''}
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
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
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Note per la rotta..."
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
                {route ? 'Aggiorna Rotta' : 'Crea Rotta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 