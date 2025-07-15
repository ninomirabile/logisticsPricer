import React, { useState, useEffect } from 'react';
import { TariffForm } from './TariffForm';

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

export const TariffManagement: React.FC = () => {
  const [tariffs, setTariffs] = useState<TariffRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTariff, setEditingTariff] = useState<TariffRate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [filterSource, setFilterSource] = useState('');

  // Mock data - in real app this would come from API
  useEffect(() => {
    const mockTariffs: TariffRate[] = [
      {
        _id: '1',
        originCountry: 'IT',
        destinationCountry: 'US',
        hsCode: '8471.30.01',
        baseRate: 5.5,
        specialRate: 2.5,
        effectiveDate: '2024-01-01',
        source: 'WTO',
        isActive: true,
        notes: 'Tariffa standard per computer'
      },
      {
        _id: '2',
        originCountry: 'DE',
        destinationCountry: 'US',
        hsCode: '8708.99.80',
        baseRate: 3.2,
        effectiveDate: '2024-01-01',
        source: 'TRADE_AGREEMENT',
        isActive: true,
        notes: 'Parti auto - accordo commerciale'
      },
      {
        _id: '3',
        originCountry: 'CN',
        destinationCountry: 'US',
        hsCode: '8517.13.00',
        baseRate: 8.5,
        specialRate: 15.0,
        effectiveDate: '2024-01-01',
        source: 'CUSTOMS_API',
        isActive: true,
        notes: 'Smartphone - tariffa anti-dumping'
      }
    ];
    
    setTimeout(() => {
      setTariffs(mockTariffs);
      setLoading(false);
    }, 1000);
  }, []);

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
      setTariffs(tariffs.filter(t => t._id !== id));
    }
  };

  const handleFormSubmit = (tariffData: Partial<TariffRate>) => {
    if (editingTariff) {
      // Update existing tariff
      setTariffs(tariffs.map(t => 
        t._id === editingTariff._id 
          ? { ...t, ...tariffData }
          : t
      ));
      setEditingTariff(null);
    } else {
      // Add new tariff
      const newTariff: TariffRate = {
        _id: Date.now().toString(),
        ...tariffData as TariffRate
      };
      setTariffs([...tariffs, newTariff]);
    }
    setShowForm(false);
  };

  const countries = ['IT', 'US', 'DE', 'CN', 'FR', 'GB', 'JP', 'KR'];
  const sources = ['WTO', 'CUSTOMS_API', 'MANUAL', 'TRADE_AGREEMENT'];

  if (loading) {
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
          Gestione Tariffe Doganali
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          ➕ Nuova Tariffa
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ricerca
            </label>
            <input
              type="text"
              placeholder="HS Code, Paese..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Paese
            </label>
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
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
              Fonte
            </label>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tutte le fonti</option>
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
              🔄 Reset
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HS Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Origine
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destinazione
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tariffa Base
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tariffa Speciale
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fonte
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTariffs.map((tariff) => (
                <tr key={tariff._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {tariff.hsCode}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tariff.originCountry}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tariff.destinationCountry}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tariff.baseRate}%
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tariff.specialRate ? `${tariff.specialRate}%` : '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      tariff.source === 'WTO' ? 'bg-blue-100 text-blue-800' :
                      tariff.source === 'CUSTOMS_API' ? 'bg-green-100 text-green-800' :
                      tariff.source === 'TRADE_AGREEMENT' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {tariff.source}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      tariff.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {tariff.isActive ? 'Attiva' : 'Inattiva'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => handleEdit(tariff)}
                        className="text-indigo-600 hover:text-indigo-900 text-xs"
                      >
                        ✏️ Modifica
                      </button>
                      <button
                        onClick={() => handleDelete(tariff._id)}
                        className="text-red-600 hover:text-red-900 text-xs"
                      >
                        🗑️ Elimina
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTariffs.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Nessuna tariffa trovata</p>
          </div>
        )}
      </div>

      {/* Tariff Form Modal */}
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