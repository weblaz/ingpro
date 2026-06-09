import React, { useState } from 'react';
import { Globe, X, ChevronDown } from 'lucide-react';
import { LANGUAGES, COUNTRIES, DEFAULT_LOCALIZATION } from '../data/localizationData';
import type { LocalizationPreferences } from '../data/localizationData';

interface LocalizationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const LocalizationSelector: React.FC<LocalizationSelectorProps> = ({ isOpen, onClose }) => {
  const [prefs, setPrefs] = useState<LocalizationPreferences>(() => {
    try {
      return JSON.parse(localStorage.getItem('localization') || '') as LocalizationPreferences;
    } catch {
      return DEFAULT_LOCALIZATION;
    }
  });

  const selectedCountry = COUNTRIES.find(c => c.code === prefs.country);

  const handleSave = () => {
    localStorage.setItem('localization', JSON.stringify(prefs));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-[#0D2B55]" />
            <h2 className="text-lg font-semibold text-gray-900">Préférences de localisation</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Langue</label>
            <div className="relative">
              <select
                value={prefs.language}
                onChange={e => setPrefs({ ...prefs, language: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55] appearance-none"
              >
                {LANGUAGES.map(l => (
                  <option key={l.code} value={l.code}>{l.flag} {l.nativeName}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Pays</label>
            <div className="relative">
              <select
                value={prefs.country}
                onChange={e => {
                  const country = COUNTRIES.find(c => c.code === e.target.value);
                  if (country) {
                    setPrefs({
                      ...prefs,
                      country: country.code,
                      currency: country.currency,
                      timezone: country.timezone,
                      city: country.cities[0],
                    });
                  }
                }}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55] appearance-none"
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* City */}
          {selectedCountry && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Ville</label>
              <div className="relative">
                <select
                  value={prefs.city}
                  onChange={e => setPrefs({ ...prefs, city: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55] appearance-none"
                >
                  {selectedCountry.cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Currency display */}
          {selectedCountry && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Devise :</span>
                <span className="font-medium">{selectedCountry.currency} ({selectedCountry.currencySymbol})</span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Fuseau horaire :</span>
                <span className="font-medium">{selectedCountry.timezone}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2.5 bg-[#0D2B55] text-white text-sm font-medium rounded-lg hover:bg-[#1a3f6f] transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocalizationSelector;
