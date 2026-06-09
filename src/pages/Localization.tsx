import React, { useState } from 'react';
import Header from '../components/Header';
import LocalizationSelector from '../components/LocalizationSelector';
import LanguageSelector from '../components/LanguageSelector';
import { Globe, Settings, MapPin, DollarSign, Clock } from 'lucide-react';
import { LANGUAGES, COUNTRIES, DEFAULT_LOCALIZATION } from '../data/localizationData';

const Localization: React.FC = () => {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const prefs = (() => {
    try { return JSON.parse(localStorage.getItem('localization') || ''); }
    catch { return DEFAULT_LOCALIZATION; }
  })();

  const country = COUNTRIES.find(c => c.code === prefs.country);
  const language = LANGUAGES.find(l => l.code === prefs.language);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Globe className="w-6 h-6 text-[#0D2B55]" /><span>Localisation</span>
            </h1>
            <p className="text-gray-500 mt-1">Configurez vos préférences de langue, région et devise</p>
          </div>
          <button onClick={() => setSelectorOpen(true)} className="flex items-center space-x-2 px-4 py-2.5 bg-[#0D2B55] text-white text-sm font-semibold rounded-xl hover:bg-[#1a3f6f] transition-colors">
            <Settings className="w-4 h-4" /><span>Modifier les préférences</span>
          </button>
        </div>

        {/* Current preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Globe, label: 'Langue', value: language ? `${language.flag} ${language.nativeName}` : prefs.language, color: 'bg-blue-50 text-blue-600' },
            { icon: MapPin, label: 'Pays / Ville', value: country ? `${country.flag} ${country.name}, ${prefs.city}` : prefs.country, color: 'bg-green-50 text-green-600' },
            { icon: DollarSign, label: 'Devise', value: country ? `${country.currency} (${country.currencySymbol})` : prefs.currency, color: 'bg-orange-50 text-orange-600' },
            { icon: Clock, label: 'Fuseau horaire', value: prefs.timezone || 'Africa/Algiers', color: 'bg-purple-50 text-purple-600' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className={`p-2 rounded-lg ${s.color} w-fit mb-2`}><Icon className="w-4 h-4" /></div>
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className="font-semibold text-gray-900 text-sm">{s.value}</p>
              </div>
            );
          })}
        </div>

        {/* Languages grid */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Langues disponibles ({LANGUAGES.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {LANGUAGES.map(l => (
              <div key={l.code} className={`flex items-center space-x-2 p-2.5 rounded-lg border transition-colors ${l.code === prefs.language ? 'border-[#0D2B55] bg-blue-50' : 'border-gray-100 hover:border-gray-200'}`}>
                <span>{l.flag}</span>
                <div>
                  <p className="text-xs font-medium text-gray-900">{l.nativeName}</p>
                  {l.rtl && <span className="text-xs text-orange-500">RTL</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Countries grid */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Pays supportés ({COUNTRIES.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {COUNTRIES.map(c => (
              <div key={c.code} className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${c.code === prefs.country ? 'border-[#0D2B55] bg-blue-50' : 'border-gray-100'}`}>
                <div className="flex items-center space-x-2">
                  <span>{c.flag}</span>
                  <p className="text-sm text-gray-900">{c.name}</p>
                </div>
                <span className="text-xs text-gray-400">{c.currency}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <LocalizationSelector isOpen={selectorOpen} onClose={() => setSelectorOpen(false)} />
    </div>
  );
};

export default Localization;
