export interface Language {
  code: string;
  name: string;
  nativeName: string;
  rtl?: boolean;
  flag: string;
}

export interface Country {
  code: string;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  cities: string[];
}

export const LANGUAGES: Language[] = [
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true, flag: '🇸🇦' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', flag: '🇳🇬' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', flag: '🇳🇬' },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo', flag: '🇳🇬' },
];

export const COUNTRIES: Country[] = [
  { code: 'DZ', name: 'Algérie', flag: '🇩🇿', currency: 'DZD', currencySymbol: 'دج', timezone: 'Africa/Algiers', cities: ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida'] },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', currency: 'NGN', currencySymbol: '₦', timezone: 'Africa/Lagos', cities: ['Lagos', 'Abuja', 'Kano', 'Port Harcourt', 'Ibadan'] },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', currency: 'GHS', currencySymbol: '₵', timezone: 'Africa/Accra', cities: ['Accra', 'Kumasi', 'Tamale', 'Sekondi', 'Cape Coast'] },
  { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮', currency: 'XOF', currencySymbol: 'CFA', timezone: 'Africa/Abidjan', cities: ['Abidjan', 'Bouaké', 'Daloa', 'San-Pédro', 'Yamoussoukro'] },
  { code: 'SN', name: 'Sénégal', flag: '🇸🇳', currency: 'XOF', currencySymbol: 'CFA', timezone: 'Africa/Dakar', cities: ['Dakar', 'Thiès', 'Kaolack', 'Ziguinchor', 'Saint-Louis'] },
  { code: 'CM', name: 'Cameroun', flag: '🇨🇲', currency: 'XAF', currencySymbol: 'FCFA', timezone: 'Africa/Douala', cities: ['Douala', 'Yaoundé', 'Bamenda', 'Bafoussam', 'Garoua'] },
  { code: 'MA', name: 'Maroc', flag: '🇲🇦', currency: 'MAD', currencySymbol: 'د.م.', timezone: 'Africa/Casablanca', cities: ['Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Tanger'] },
  { code: 'TN', name: 'Tunisie', flag: '🇹🇳', currency: 'TND', currencySymbol: 'د.ت', timezone: 'Africa/Tunis', cities: ['Tunis', 'Sfax', 'Sousse', 'Bizerte', 'Kairouan'] },
  { code: 'EG', name: 'Égypte', flag: '🇪🇬', currency: 'EGP', currencySymbol: 'ج.م', timezone: 'Africa/Cairo', cities: ['Le Caire', 'Alexandrie', 'Gizeh', 'Suez', 'Louxor'] },
  { code: 'SA', name: 'Arabie Saoudite', flag: '🇸🇦', currency: 'SAR', currencySymbol: '﷼', timezone: 'Asia/Riyadh', cities: ['Riyad', 'Djeddah', 'La Mecque', 'Médine', 'Dammam'] },
  { code: 'AE', name: 'Émirats Arabes Unis', flag: '🇦🇪', currency: 'AED', currencySymbol: 'د.إ', timezone: 'Asia/Dubai', cities: ['Dubaï', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Al Ain'] },
  { code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR', currencySymbol: '€', timezone: 'Europe/Paris', cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'] },
  { code: 'US', name: 'États-Unis', flag: '🇺🇸', currency: 'USD', currencySymbol: '$', timezone: 'America/New_York', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'] },
  { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧', currency: 'GBP', currencySymbol: '£', timezone: 'Europe/London', cities: ['Londres', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow'] },
  { code: 'CN', name: 'Chine', flag: '🇨🇳', currency: 'CNY', currencySymbol: '¥', timezone: 'Asia/Shanghai', cities: ['Pékin', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu'] },
];

export interface LocalizationPreferences {
  language: string;
  country: string;
  city: string;
  currency: string;
  timezone: string;
}

export const DEFAULT_LOCALIZATION: LocalizationPreferences = {
  language: 'fr',
  country: 'DZ',
  city: 'Alger',
  currency: 'DZD',
  timezone: 'Africa/Algiers',
};
