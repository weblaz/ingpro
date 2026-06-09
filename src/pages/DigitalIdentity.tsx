import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { supabase } from '../supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Search, Building2, User } from 'lucide-react';

interface Identity {
  id: string;
  identity_type: string;
  name: string;
  email: string;
  country: string;
  trust_score: number;
  blockchain_hash: string;
  qr_code: string;
  created_at: string;
}

const DigitalIdentity: React.FC = () => {
  const { user } = useAuth();
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'company' | 'individual'>('all');

  useEffect(() => {
    if (!user?.tenant) return;
    supabase.from('digital_identities').select('*').eq('tenant_id', user.tenant).order('created_at', { ascending: false })
      .then(({ data }) => { setIdentities(data || []); setLoading(false); });
  }, [user]);

  const filtered = identities.filter(i => {
    const matchType = typeFilter === 'all' || i.identity_type === typeFilter;
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.email.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Shield className="w-6 h-6 text-[#0D2B55]" />
            <span>Identités Numériques</span>
          </h1>
          <p className="text-gray-500 mt-1">Passeports numériques certifiés blockchain pour entreprises et individus</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55] w-full" />
          </div>
          <div className="flex rounded-xl border border-gray-300 overflow-hidden bg-white text-sm">
            {(['all', 'company', 'individual'] as const).map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} className={`px-4 py-2 font-medium transition-colors ${typeFilter === t ? 'bg-[#0D2B55] text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                {t === 'all' ? 'Tous' : t === 'company' ? 'Entreprises' : 'Individus'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D2B55]"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune identité numérique</h3>
            <p className="text-gray-400 text-sm">Les identités numériques sont créées automatiquement lors de la création de passeports entreprise ou de profils talent.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(id => (
              <div key={id.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-lg ${id.identity_type === 'company' ? 'bg-blue-50' : 'bg-purple-50'}`}>
                      {id.identity_type === 'company' ? <Building2 className="w-4 h-4 text-blue-600" /> : <User className="w-4 h-4 text-purple-600" />}
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${id.identity_type === 'company' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                      {id.identity_type === 'company' ? 'Entreprise' : 'Individu'}
                    </span>
                  </div>
                  {id.qr_code && <img src={id.qr_code} alt="QR" className="w-10 h-10 rounded" />}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{id.name}</h3>
                <p className="text-sm text-gray-500 mb-1">{id.email}</p>
                <p className="text-xs text-gray-400 mb-3">🌍 {id.country}</p>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-700">{id.trust_score}</span>
                  </div>
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 rounded-full" style={{ width: `${id.trust_score}%` }}></div>
                  </div>
                </div>
                <p className="text-xs font-mono text-gray-300 truncate">{id.blockchain_hash}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DigitalIdentity;
