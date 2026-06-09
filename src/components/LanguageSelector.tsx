import React, { useState } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { ChevronDown } from 'lucide-react';
import { LANGUAGES } from '../data/localizationData';

const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useI18n();
  const [open, setOpen] = useState(false);

  const current = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <span>{current.flag}</span>
        <span className="hidden sm:block font-medium">{current.code.toUpperCase()}</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 max-h-60 overflow-auto">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => { setLanguage(lang.code); setOpen(false); }}
              className={`flex items-center space-x-2.5 w-full px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                lang.code === language ? 'text-[#0D2B55] font-medium' : 'text-gray-700'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.nativeName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
