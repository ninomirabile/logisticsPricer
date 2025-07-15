import React, { useState, useEffect } from 'react';
import {
  getUSDuties,
  createUSDuty,
  updateUSDuty,
  deleteUSDuty,
  USDuty
} from '../../services/usaDutiesService';

export const USDutiesManagement: React.FC = () => {
  const [duties, setDuties] = useState<USDuty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDuty, setEditingDuty] = useState<USDuty | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const [refresh, setRefresh] = useState(0);

  // Fetch duties from API
  useEffect(() => {
    setLoading(true);
    setError(null);
    getUSDuties({ search: searchTerm, section: filterSection, limit: 100 })
      .then(res => {
        setDuties(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Errore nel caricamento dei dazi USA');
        setLoading(false);
      });
  }, [searchTerm, filterSection, refresh]);

  const filteredDuties = duties; // Filtering is now handled by API

  const handleEdit = (duty: USDuty) => {
    setEditingDuty(duty);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo dazio USA?')) {
      setLoading(true);
      setError(null);
      try {
        await deleteUSDuty(id);
        setRefresh(r => r + 1);
      } catch {
        setError('Errore durante l\'eliminazione');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormSubmit = async (dutyData: Partial<USDuty>) => {
    setLoading(true);
    setError(null);
    try {
      if (editingDuty && editingDuty._id) {
        await updateUSDuty(editingDuty._id, dutyData);
      } else {
        await createUSDuty(dutyData);
      }
      setShowForm(false);
      setEditingDuty(null);
      setRefresh(r => r + 1);
    } catch {
      setError('Errore durante il salvataggio');
    } finally {
      setLoading(false);
    }
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
          onClick={() => { setShowForm(true); setEditingDuty(null); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          ➕ Nuovo Dazio USA
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
      )}

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
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Cerca per HS code o descrizione..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={filterSection}
          onChange={e => setFilterSection(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Tutte le Section</option>
          {sections.map(s => (
            <option key={s.code} value={s.code}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Duties Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr>
              <th className="px-4 py-2">HS Code</th>
              <th className="px-4 py-2">Descrizione</th>
              <th className="px-4 py-2">Base Rate</th>
              <th className="px-4 py-2">301</th>
              <th className="px-4 py-2">232</th>
              <th className="px-4 py-2">201</th>
              <th className="px-4 py-2">Fonte</th>
              <th className="px-4 py-2">Attivo</th>
              <th className="px-4 py-2">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {filteredDuties.map(duty => (
              <tr key={duty._id} className="border-t">
                <td className="px-4 py-2 font-mono">{duty.hsCode}</td>
                <td className="px-4 py-2">{duty.productDescription}</td>
                <td className="px-4 py-2">{duty.baseRate}%</td>
                <td className="px-4 py-2">{duty.section301Rate ?? '-'}</td>
                <td className="px-4 py-2">{duty.section232Rate ?? '-'}</td>
                <td className="px-4 py-2">{duty.section201Rate ?? '-'}</td>
                <td className="px-4 py-2">{sources.find(s => s.code === duty.source)?.name || duty.source}</td>
                <td className="px-4 py-2">
                  {duty.isActive ? <span className="text-green-600 font-bold">SI</span> : <span className="text-red-600 font-bold">NO</span>}
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    className="text-indigo-600 hover:underline"
                    onClick={() => handleEdit(duty)}
                  >Modifica</button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => duty._id && handleDelete(duty._id)}
                  >Elimina</button>
                </td>
              </tr>
            ))}
            {filteredDuties.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-6 text-gray-500">Nessun dazio trovato.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showForm && (
        <DutyForm
          duty={editingDuty}
          onClose={() => { setShowForm(false); setEditingDuty(null); }}
          onSubmit={handleFormSubmit}
          sources={sources}
        />
      )}
    </div>
  );
};

// DutyForm component (semplificato per brevità)
interface DutyFormProps {
  duty: USDuty | null;
  onClose: () => void;
  onSubmit: (data: Partial<USDuty>) => void;
  sources: { code: string; name: string }[];
}

const DutyForm: React.FC<DutyFormProps> = ({ duty, onClose, onSubmit, sources }) => {
  const [form, setForm] = useState<Partial<USDuty>>(duty || {
    hsCode: '',
    productDescription: '',
    baseRate: 0,
    effectiveDate: new Date().toISOString().slice(0, 10),
    source: 'MANUAL',
    isActive: true,
    notes: ''
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let newValue: string | number | boolean = value;
    if (type === 'checkbox' && 'checked' in e.target) {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      newValue = parseFloat(value) || 0;
    }
    setForm(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.hsCode || !form.productDescription || form.baseRate === undefined) {
      setError('HS Code, descrizione e base rate sono obbligatori');
      return;
    }
    setError(null);
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={onClose}
        >✖️</button>
        <h3 className="text-lg font-semibold mb-4">{duty ? 'Modifica Dazio USA' : 'Nuovo Dazio USA'}</h3>
        {error && <div className="mb-2 p-2 bg-red-100 text-red-700 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">HS Code *</label>
            <input
              type="text"
              name="hsCode"
              value={form.hsCode || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Descrizione *</label>
            <input
              type="text"
              name="productDescription"
              value={form.productDescription || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Base Rate (%) *</label>
              <input
                type="number"
                name="baseRate"
                value={form.baseRate ?? ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                min={0}
                max={100}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Section 301 (%)</label>
              <input
                type="number"
                name="section301Rate"
                value={form.section301Rate ?? ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                min={0}
                max={100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Section 232 (%)</label>
              <input
                type="number"
                name="section232Rate"
                value={form.section232Rate ?? ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                min={0}
                max={100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Section 201 (%)</label>
              <input
                type="number"
                name="section201Rate"
                value={form.section201Rate ?? ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                min={0}
                max={100}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Data Inizio *</label>
            <input
              type="date"
              name="effectiveDate"
              value={form.effectiveDate?.slice(0, 10) || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Data Fine</label>
            <input
              type="date"
              name="expiryDate"
              value={form.expiryDate?.slice(0, 10) || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Fonte *</label>
            <select
              name="source"
              value={form.source || 'MANUAL'}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            >
              {sources.map(s => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Attivo</label>
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive ?? true}
              onChange={handleChange}
              className="ml-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Note</label>
            <textarea
              name="notes"
              value={form.notes || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              onClick={onClose}
            >Annulla</button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >Salva</button>
          </div>
        </form>
      </div>
    </div>
  );
}; 