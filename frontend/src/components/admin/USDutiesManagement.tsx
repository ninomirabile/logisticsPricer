import React, { useState, useEffect } from 'react';

interface USDuty {
  _id: string;
  hsCode: string;
  productDescription: string;
  baseRate: number;
  section301Rate?: number;
  section232Rate?: number;
  section201Rate?: number;
  effectiveDate: string;
  expiryDate?: string;
  source: string;
  isActive: boolean;
  notes?: string;
}

export const USDutiesManagement: React.FC = () => {
  const [duties, setDuties] = useState<USDuty[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDuty, setEditingDuty] = useState<USDuty | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSection, setFilterSection] = useState('');

  // Mock data - in real app this would come from API
  useEffect(() => {
    const mockDuties: USDuty[] = [
      {
        _id: '1',
        hsCode: '8517.13.00',
        productDescription: 'Smartphone',
        baseRate: 3.9,
        section301Rate: 15.0,
        effectiveDate: '2024-01-01',
        source: 'USTR',
        isActive: true,
        notes: 'Tariffa Section 301 per prodotti cinesi'
      },
      {
        _id: '2',
        hsCode: '7208.51.00',
        productDescription: 'Acciaio in fogli',
        baseRate: 2.5,
        section232Rate: 25.0,
        effectiveDate: '2024-01-01',
        source: 'DOC',
        isActive: true,
        notes: 'Tariffa Section 232 per acciaio'
      },
      {
        _id: '3',
        hsCode: '8471.30.01',
        productDescription: 'Computer portatili',
        baseRate: 0.0,
        section301Rate: 7.5,
        effectiveDate: '2024-01-01',
        source: 'USTR',
        isActive: true,
        notes: 'Computer - tariffa ridotta'
      }
    ];
    
    setTimeout(() => {
      setDuties(mockDuties);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredDuties = duties.filter(duty => {
    const matchesSearch = 
      duty.hsCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      duty.productDescription.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSection = !filterSection || 
      (filterSection === '301' && duty.section301Rate) ||
      (filterSection === '232' && duty.section232Rate) ||
      (filterSection === '201' && duty.section201Rate);
    
    return matchesSearch && matchesSection;
  });

  const handleEdit = (duty: USDuty) => {
    setEditingDuty(duty);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo dazio USA?')) {
      setDuties(duties.filter(d => d._id !== id));
    }
  };

  const handleFormSubmit = (dutyData: Partial<USDuty>) => {
    if (editingDuty) {
      setDuties(duties.map(d => 
        d._id === editingDuty._id 
          ? { ...d, ...dutyData }
          : d
      ));
      setEditingDuty(null);
    } else {
      const newDuty: USDuty = {
        _id: Date.now().toString(),
        ...dutyData as USDuty
      };
      setDuties([...duties, newDuty]);
    }
    setShowForm(false);
  };

  const sections = [
    { code: '301', name: 'Section 301 - Trade Act' },
    { code: '232', name: 'Section 232 - National Security' },
    { code: '201', name: 'Section 201 - Safeguards' }
  ];

  const sources = [
    { code: 'USTR', name: 'U.S. Trade Representative' },
    { code: 'DOC', name: 'Department of Commerce' },
    { code: 'CBP', name: 'Customs and Border Protection' },
    { code: 'MANUAL', name: 'Inserimento Manuale' }
  ];

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
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            🇺🇸 Gestione Dazi USA
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Gestione delle tariffe doganali specifiche per gli Stati Uniti
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          ➕ Nuovo Dazio USA
        </button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-2xl">🇺🇸</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Section 301</p>
              <p className="text-2xl font-semibold text-gray-900">
                {duties.filter(d => d.section301Rate).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">🛡️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Section 232</p>
              <p className="text-2xl font-semibold text-gray-900">
                {duties.filter(d => d.section232Rate).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⚖️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Section 201</p>
              <p className="text-2xl font-semibold text-gray-900">
                {duties.filter(d => d.section201Rate).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Totale Attive</p>
              <p className="text-2xl font-semibold text-gray-900">
                {duties.filter(d => d.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ricerca
            </label>
            <input
              type="text"
              placeholder="HS Code, prodotto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sezione
            </label>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tutte le sezioni</option>
              {sections.map(section => (
                <option key={section.code} value={section.code}>{section.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterSection('');
              }}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              🔄 Reset
            </button>
          </div>
        </div>
      </div>

      {/* Duties Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  HS Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prodotto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tariffa Base
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Section 301
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Section 232
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Section 201
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
              {filteredDuties.map((duty) => (
                <tr key={duty._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {duty.hsCode}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {duty.productDescription}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {duty.baseRate}%
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {duty.section301Rate ? `${duty.section301Rate}%` : '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {duty.section232Rate ? `${duty.section232Rate}%` : '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {duty.section201Rate ? `${duty.section201Rate}%` : '-'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      duty.source === 'USTR' ? 'bg-red-100 text-red-800' :
                      duty.source === 'DOC' ? 'bg-blue-100 text-blue-800' :
                      duty.source === 'CBP' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {duty.source}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      duty.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {duty.isActive ? 'Attiva' : 'Inattiva'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => handleEdit(duty)}
                        className="text-indigo-600 hover:text-indigo-900 text-xs"
                      >
                        ✏️ Modifica
                      </button>
                      <button
                        onClick={() => handleDelete(duty._id)}
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
        
        {filteredDuties.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Nessun dazio USA trovato</p>
          </div>
        )}
      </div>

      {/* Coming Soon Notice */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-2xl">🚀</span>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-blue-900">
              Modulo Dazi USA in Sviluppo
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Questo modulo sarà presto integrato con:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>API ufficiali USTR e DOC per aggiornamenti automatici</li>
                <li>Calcolo automatico delle tariffe Section 301, 232, 201</li>
                <li>Gestione delle esenzioni e deroghe</li>
                <li>Notifiche per modifiche normative</li>
                <li>Integrazione con il calcolatore principale</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 