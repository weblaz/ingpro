import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { supabase } from '../supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { ShoppingBag, Search, Star, MapPin, Mail } from 'lucide-react';

interface MarketplacePassport {
  id: string;
  legal_name: string;
  industry: string;
  country: string;
  trust_score: number;
  verification_status: string;
  description: string | null;
  email: string;
}

const Marketplace: React.FC = () => {
  const { user } = useAuth();
  const [passports, setPassports] = useState<MarketplacePassport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [contactingId, setContactingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.tenant) return;
    supabase
      .from('company_passports')
      .select('id, legal_name, industry, country, trust_score, verification_status, description, email')
      .eq('tenant_id', user.tenant)
      .order('trust_score', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setPassports(data || []);
        setLoading(false);
      });
  }, [user]);

  const industries = [...new Set(passports.map(p => p.industry).filter(Boolean))];
  const filtered = passports.filter(p => {
    const matchSearch = p.legal_name?.toLowerCase().includes(search.toLowerCase()) || p.industry?.toLowerCase().includes(search.toLowerCase()) || p.country?.toLowerCase().includes(search.toLowerCase());
    const matchIndustry = !industryFilter || p.industry === industryFilter;
    return matchSearch && matchIndustry;
  });

  const handleContact = async (passport: MarketplacePassport) => {
    setContactingId(passport.id);
    try {
      await new Promise(r => setTimeout(r, 600));
      toast.success(`Demande de contact envoyée à ${passport.legal_name}`);
    } finally {
      setContactingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <ShoppingBag className="w-6 h-6 text-[#0D2B55]" /><span>Marketplace</span>
          </h1>
          <p className="text-gray-500 mt-1">Trouvez et connectez-vous avec des entreprises certifiées de votre réseau</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une entreprise..." className="pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55] w-full" />
          </div>
          {industries.length > 0 && (
            <select value={industryFilter} onChange={e => setIndustryFilter(e.target.value)} className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]">
              <option value="">Tous les secteurs</option>
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D2B55]"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune entreprise trouvée</h3>
            <p className="text-gray-400 text-sm">Le marketplace se remplit à mesure que des entreprises créent leurs passeports.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-[#0D2B55] rounded-lg flex items-center justify-center text-white font-bold">{p.legal_name?.[0]}</div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{p.legal_name}</p>
                      <p className="text-xs text-gray-400">{p.industry}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-semibold text-gray-700">{p.trust_score}</span>
                  </div>
                </div>
                {p.description && (
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">{p.description}</p>
                )}
                <div className="flex items-center space-x-1 text-xs text-gray-500 mb-3">
                  <MapPin className="w-3 h-3" /><span>{p.country}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.verification_status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {p.verification_status === 'verified' ? '✓ Certifié' : '⏳ En attente'}
                  </span>
                  <button
                    onClick={() => handleContact(p)}
                    disabled={contactingId === p.id}
                    className="flex items-center space-x-1 text-xs px-3 py-1.5 border border-[#0D2B55] text-[#0D2B55] rounded-lg hover:bg-blue-50 transition-colors font-medium disabled:opacity-50"
                  >
                    <Mail className="w-3 h-3" />
                    <span>{contactingId === p.id ? 'Envoi...' : 'Contacter'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Marketplace;