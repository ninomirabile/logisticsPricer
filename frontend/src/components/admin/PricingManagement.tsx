import React, { useState, useEffect } from 'react';

interface PricingConfig {
  _id: string;
  transportType: string;
  baseCost: number;
  weightMultiplier: number;
  volumeMultiplier: number;
  urgencyMultipliers: {
    standard: number;
    express: number;
    urgent: number;
  };
  additionalCosts: {
    customsClearance: number;
    documentation: number;
    insurancePercentage: number;
    handling: number;
  };
  isActive: boolean;
  notes?: string;
}

export const PricingManagement: React.FC = () => {
  const [configs, setConfigs] = useState<PricingConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<PricingConfig | null>(null);

  // Mock data - in real app this would come from API
  useEffect(() => {
    const mockConfigs: PricingConfig[] = [
      {
        _id: '1',
        transportType: 'road',
        baseCost: 50,
        weightMultiplier: 0.5,
        volumeMultiplier: 0.2,
        urgencyMultipliers: {
          standard: 1.0,
          express: 1.5,
          urgent: 2.0
        },
        additionalCosts: {
          customsClearance: 150,
          documentation: 50,
          insurancePercentage: 2.0,
          handling: 50
        },
        isActive: true,
        notes: 'Configurazione standard per trasporto su strada'
      },
      {
        _id: '2',
        transportType: 'air',
        baseCost: 100,
        weightMultiplier: 1.2,
        volumeMultiplier: 0.5,
        urgencyMultipliers: {
          standard: 1.0,
          express: 1.3,
          urgent: 1.8
        },
        additionalCosts: {
          customsClearance: 200,
          documentation: 75,
          insurancePercentage: 2.5,
          handling: 100
        },
        isActive: true,
        notes: 'Configurazione per trasporto aereo'
      },
      {
        _id: '3',
        transportType: 'sea',
        baseCost: 30,
        weightMultiplier: 0.3,
        volumeMultiplier: 0.1,
        urgencyMultipliers: {
          standard: 1.0,
          express: 1.8,
          urgent: 2.5
        },
        additionalCosts: {
          customsClearance: 300,
          documentation: 100,
          insurancePercentage: 1.5,
          handling: 200
        },
        isActive: true,
        notes: 'Configurazione per trasporto marittimo'
      }
    ];
    
    setTimeout(() => {
      setConfigs(mockConfigs);
      setLoading(false);
    }, 1000);
  }, []);

  const handleEdit = (config: PricingConfig) => {
    setEditingConfig(config);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa configurazione?')) {
      setConfigs(configs.filter(c => c._id !== id));
    }
  };

  const handleFormSubmit = (configData: Partial<PricingConfig>) => {
    if (editingConfig) {
      // Update existing config
      setConfigs(configs.map(c => 
        c._id === editingConfig._id 
          ? { ...c, ...configData }
          : c
      ));
      setEditingConfig(null);
    } else {
      // Add new config
      const newConfig: PricingConfig = {
        _id: Date.now().toString(),
        ...configData as PricingConfig
      };
      setConfigs([...configs, newConfig]);
    }
    setShowForm(false);
  };

  const transportTypes = [
    { code: 'road', name: 'Trasporto su Strada' },
    { code: 'air', name: 'Trasporto Aereo' },
    { code: 'sea', name: 'Trasporto Marittimo' },
    { code: 'rail', name: 'Trasporto Ferroviario' }
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
        <h2 className="text-xl font-semibold text-gray-900">
          Gestione Prezzi Base
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          ➕ Nuova Configurazione
        </button>
      </div>

      {/* Pricing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {configs.map((config) => (
          <div key={config._id} className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {transportTypes.find(t => t.code === config.transportType)?.name || config.transportType}
              </h3>
              <span className={`px-2 py-1 text-xs rounded-full ${
                config.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {config.isActive ? 'Attiva' : 'Inattiva'}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Costo Base:</span>
                <span className="text-sm font-medium">€{config.baseCost}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Moltiplicatore Peso:</span>
                <span className="text-sm font-medium">€{config.weightMultiplier}/kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Moltiplicatore Volume:</span>
                <span className="text-sm font-medium">€{config.volumeMultiplier}/m³</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Assicurazione:</span>
                <span className="text-sm font-medium">{config.additionalCosts.insurancePercentage}%</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(config)}
                  className="flex-1 text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  ✏️ Modifica
                </button>
                <button
                  onClick={() => handleDelete(config._id)}
                  className="flex-1 text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  🗑️ Elimina
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Configurazioni Dettagliate
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo Trasporto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Costo Base
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Moltiplicatori
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urgenza
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Costi Aggiuntivi
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stato
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {configs.map((config) => (
                <tr key={config._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {transportTypes.find(t => t.code === config.transportType)?.name || config.transportType}
                    </div>
                    {config.notes && (
                      <div className="text-sm text-gray-500">{config.notes}</div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    €{config.baseCost}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>Peso: €{config.weightMultiplier}/kg</div>
                    <div>Volume: €{config.volumeMultiplier}/m³</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>Standard: {config.urgencyMultipliers.standard}x</div>
                    <div>Express: {config.urgencyMultipliers.express}x</div>
                    <div>Urgente: {config.urgencyMultipliers.urgent}x</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>Dogane: €{config.additionalCosts.customsClearance}</div>
                    <div>Documenti: €{config.additionalCosts.documentation}</div>
                    <div>Assicurazione: {config.additionalCosts.insurancePercentage}%</div>
                    <div>Handling: €{config.additionalCosts.handling}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      config.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {config.isActive ? 'Attiva' : 'Inattiva'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing Form Modal */}
      {showForm && (
        <PricingForm
          config={editingConfig}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingConfig(null);
          }}
        />
      )}
    </div>
  );
};

// Pricing Form Component
interface PricingFormProps {
  config?: PricingConfig | null;
  onSubmit: (data: Partial<PricingConfig>) => void;
  onCancel: () => void;
}

const PricingForm: React.FC<PricingFormProps> = ({ config, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<PricingConfig>>({
    transportType: 'road',
    baseCost: 50,
    weightMultiplier: 0.5,
    volumeMultiplier: 0.2,
    urgencyMultipliers: {
      standard: 1.0,
      express: 1.5,
      urgent: 2.0
    },
    additionalCosts: {
      customsClearance: 150,
      documentation: 50,
      insurancePercentage: 2.0,
      handling: 50
    },
    isActive: true,
    notes: ''
  });

  const transportTypes = [
    { code: 'road', name: 'Trasporto su Strada' },
    { code: 'air', name: 'Trasporto Aereo' },
    { code: 'sea', name: 'Trasporto Marittimo' },
    { code: 'rail', name: 'Trasporto Ferroviario' }
  ];

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
              {config ? 'Modifica Configurazione' : 'Nuova Configurazione Prezzi'}
            </h3>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo di Trasporto
                </label>
                <select
                  value={formData.transportType}
                  onChange={(e) => setFormData({...formData, transportType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {transportTypes.map(type => (
                    <option key={type.code} value={type.code}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Costo Base (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.baseCost}
                  onChange={(e) => setFormData({...formData, baseCost: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Multipliers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moltiplicatore Peso (€/kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.weightMultiplier}
                  onChange={(e) => setFormData({...formData, weightMultiplier: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moltiplicatore Volume (€/m³)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.volumeMultiplier}
                  onChange={(e) => setFormData({...formData, volumeMultiplier: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Urgency Multipliers */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Moltiplicatori Urgenza</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Standard
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.urgencyMultipliers?.standard}
                    onChange={(e) => setFormData({
                      ...formData, 
                      urgencyMultipliers: {
                        ...formData.urgencyMultipliers!,
                        standard: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Express
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.urgencyMultipliers?.express}
                    onChange={(e) => setFormData({
                      ...formData, 
                      urgencyMultipliers: {
                        ...formData.urgencyMultipliers!,
                        express: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgente
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.urgencyMultipliers?.urgent}
                    onChange={(e) => setFormData({
                      ...formData, 
                      urgencyMultipliers: {
                        ...formData.urgencyMultipliers!,
                        urgent: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Additional Costs */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Costi Aggiuntivi</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spese Doganali (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.additionalCosts?.customsClearance}
                    onChange={(e) => setFormData({
                      ...formData, 
                      additionalCosts: {
                        ...formData.additionalCosts!,
                        customsClearance: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Documentazione (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.additionalCosts?.documentation}
                    onChange={(e) => setFormData({
                      ...formData, 
                      additionalCosts: {
                        ...formData.additionalCosts!,
                        documentation: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assicurazione (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.additionalCosts?.insurancePercentage}
                    onChange={(e) => setFormData({
                      ...formData, 
                      additionalCosts: {
                        ...formData.additionalCosts!,
                        insurancePercentage: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Handling (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.additionalCosts?.handling}
                    onChange={(e) => setFormData({
                      ...formData, 
                      additionalCosts: {
                        ...formData.additionalCosts!,
                        handling: Number(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Status and Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stato
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Configurazione attiva
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note (opzionale)
                </label>
                <textarea
                  rows={3}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Descrizione della configurazione..."
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
                Annulla
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                {config ? 'Aggiorna' : 'Crea'} Configurazione
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 