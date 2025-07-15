import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

export const useLanguage = () => {
  const { i18n, t } = useTranslation();

  const currentLanguage = i18n.language;
  const isItalian = currentLanguage === 'it';
  const isEnglish = currentLanguage === 'en';

  const switchLanguage = useCallback((language: 'it' | 'en') => {
    i18n.changeLanguage(language);
  }, [i18n]);

  const toggleLanguage = useCallback(() => {
    const newLang = currentLanguage === 'it' ? 'en' : 'it';
    switchLanguage(newLang);
  }, [currentLanguage, switchLanguage]);

  return {
    currentLanguage,
    isItalian,
    isEnglish,
    switchLanguage,
    toggleLanguage,
    t,
  };
}; 