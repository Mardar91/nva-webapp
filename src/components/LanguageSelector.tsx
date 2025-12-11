import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'header' | 'minimal' | 'dropdown';
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'header' }) => {
  const { i18n } = useTranslation();

  const currentLang = i18n.language?.startsWith('it') ? 'it' : 'en';
  const otherLang = currentLang === 'en' ? 'it' : 'en';

  const toggleLanguage = () => {
    i18n.changeLanguage(otherLang);
  };

  if (variant === 'minimal') {
    return (
      <button
        onClick={toggleLanguage}
        className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <Globe className="h-3.5 w-3.5" />
        <span className="uppercase">{currentLang}</span>
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <button
        onClick={toggleLanguage}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <Globe className="h-4 w-4 text-gray-400" />
        <span>{currentLang === 'en' ? 'Italiano' : 'English'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-2.5 py-1.5 rounded-lg text-white text-xs font-medium transition-all duration-200 border border-white/20"
      aria-label="Change language"
    >
      <Globe className="h-3.5 w-3.5" />
      <span className="uppercase">{currentLang === 'en' ? 'EN' : 'IT'}</span>
    </button>
  );
};

export default LanguageSelector;
