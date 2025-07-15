import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { TariffManagement } from './TariffManagement';
import { PricingManagement } from './PricingManagement';
import { USDutiesManagement } from './USDutiesManagement';
import { Analytics } from './Analytics';

export const AdminDashboard: React.FC = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Panoramica', href: '/admin', icon: '📊' },
    { name: 'Gestione Tariffe', href: '/admin/tariffs', icon: '💰' },
    { name: 'Gestione Prezzi', href: '/admin/pricing', icon: '📈' },
    { name: 'Dazi USA', href: '/admin/us-duties', icon: '🇺🇸' },
    { name: 'Analytics', href: '/admin/analytics', icon: '📋' },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">
            🛠️ Dashboard Amministrativa
          </h1>
          <p className="text-indigo-100 mt-1">
            Gestione completa di prezzi, tariffe e configurazioni
          </p>
        </div>

        <div className="flex">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-gray-50 border-r flex-shrink-0">
            <nav className="p-4">
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive(item.href)
                          ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-500'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-4 min-w-0">
            <Routes>
              <Route path="/" element={<DashboardOverview />} />
              <Route path="/tariffs" element={<TariffManagement />} />
              <Route path="/pricing" element={<PricingManagement />} />
              <Route path="/us-duties" element={<USDutiesManagement />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview: React.FC = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Panoramica Dashboard
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stat Cards */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tariffe Attive</p>
              <p className="text-2xl font-semibold text-gray-900">1,247</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Calcoli Oggi</p>
              <p className="text-2xl font-semibold text-gray-900">342</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">🇺🇸</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Dazi USA</p>
              <p className="text-2xl font-semibold text-gray-900">89</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Utenti Attivi</p>
              <p className="text-2xl font-semibold text-gray-900">156</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Azioni Rapide
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/tariffs"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mr-3">➕</span>
            <div>
              <p className="font-medium text-gray-900">Aggiungi Tariffa</p>
              <p className="text-sm text-gray-600">Nuova tariffa doganale</p>
            </div>
          </Link>

          <Link
            to="/admin/pricing"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mr-3">⚙️</span>
            <div>
              <p className="font-medium text-gray-900">Configura Prezzi</p>
              <p className="text-sm text-gray-600">Modifica prezzi base</p>
            </div>
          </Link>

          <Link
            to="/admin/us-duties"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mr-3">🇺🇸</span>
            <div>
              <p className="font-medium text-gray-900">Dazi USA</p>
              <p className="text-sm text-gray-600">Gestisci tariffe USA</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}; 