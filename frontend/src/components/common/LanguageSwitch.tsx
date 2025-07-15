import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { Globe, Languages } from 'lucide-react';

export const LanguageSwitch: React.FC = () => {
  const { currentLanguage, toggleLanguage, t } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
      title={t('language.switchLanguage')}
    >
      <Globe className="w-4 h-4" />
      <Languages className="w-4 h-4" />
      <span className="hidden sm:inline">
        {currentLanguage === 'it' ? 'IT' : 'EN'}
      </span>
    </button>
  );
}; 