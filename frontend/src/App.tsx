import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { PricingCalculator } from './components/business/PricingCalculator';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LanguageSwitch } from './components/common/LanguageSwitch';
import { useTranslation } from 'react-i18next';
import './index.css';

function App() {
  const { t } = useTranslation();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Header */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-xl font-bold text-gray-900">
                    🚚 LogisticsPricer
                  </h1>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  to="/" 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('navigation.pricing')}
                </Link>
                <Link 
                  to="/admin" 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('navigation.dashboard')}
                </Link>
                <LanguageSwitch />
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <Routes>
          <Route path="/" element={<PricingCalculator />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 