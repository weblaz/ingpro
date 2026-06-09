import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import CompanyPassportForm from '../components/CompanyPassportForm';
import { supabase } from '../supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { Building2, Plus, Shield, QrCode, ExternalLink, Search } from 'lucide-react';

interface Passport {
  id: string;
  legal_name: string;
  trade_name: string;
  country: string;
  industry: string;
  trust_score: number;
  verification_status: string;
  blockchain_hash: string;
  qr_code: string;
  created_at: string;
}

const PassportCard: React.FC<{ p: Passport }> = ({ p }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="font-semibold text-gray-900">{p.legal_name}</h3>
        {p.trade_name !== p.legal_name && <p className="text-xs text-gray-400">{p.trade_name}</p>}
      </div>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
        p.verification_status === 'verified' ? 'bg-green-100 text-green-700' :
        p.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
        'bg-red-100 text-red-600'
      }`}>
        {p.verification_status === 'verified' ? '✓ Vérifié' : p.verification_status === 'pending' ? '⏳ En attente' : 'Rejeté'}
      </span>
    </div>
    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
      <span>🌍 {p.country}</span>
      <span>🏭 {p.industry}</span>
    </div>
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <span className="text-xs font-bold text-gray-700">{p.trust_score}</span>
        </div>
        <div>
          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 rounded-full" style={{ width: `${p.trust_score}%` }}></div>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Score de confiance</p>
        </div>
      </div>
      {p.qr_code && (
        <img src={p.qr_code} alt="QR Code" className="w-12 h-12 rounded" />
      )}
    </div>
    <div className="mt-3 pt-3 border-t border-gray-100">
      <p className="text-xs font-mono text-gray-400 truncate">{p.blockchain_hash}</p>
    </div>
  </div>
);

const Passeport: React.FC = () => {
  const { user } = useAuth();
  const [passports, setPassports] = useState<Passport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const fetchPassports = async () => {
    if (!user?.tenant) return;
    const { data } = await supabase
      .from('company_passports')
      .select('*')
      .eq('tenant_id', user.tenant)
      .order('created_at', { ascending: false });
    setPassports(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPassports(); }, [user]);

  const filtered = passports.filter(p =>
    p.legal_name.toLowerCase().includes(search.toLowerCase()) ||
    p.country.toLowerCase().includes(search.toLowerCase()) ||
    p.industry.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Building2 className="w-6 h-6 text-[#0D2B55]" />
              <span>Passeport Entreprise</span>
            </h1>
            <p className="text-gray-500 mt-1">Certification KYB et identité numérique de vos entreprises partenaires</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-[#0D2B55] text-white text-sm font-semibold rounded-xl hover:bg-[#1a3f6f] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau passeport</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{passports.length}</p>
            <p className="text-xs text-gray-500">Total passeports</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{passports.filter(p => p.verification_status === 'verified').length}</p>
            <p className="text-xs text-gray-500">Vérifiés</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{passports.filter(p => p.verification_status === 'pending').length}</p>
            <p className="text-xs text-gray-500">En attente</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par nom, pays ou secteur..."
            className="pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55] w-full sm:w-80"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D2B55]"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {passports.length === 0 ? 'Aucun passeport créé' : 'Aucun résultat'}
            </h3>
            <p className="text-gray-400 mb-6 text-sm">
              {passports.length === 0 ? 'Créez votre premier passeport entreprise pour commencer la certification.' : 'Essayez d\'autres termes de recherche.'}
            </p>
            {passports.length === 0 && (
              <button onClick={() => setShowForm(true)} className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#0D2B55] text-white text-sm font-semibold rounded-xl hover:bg-[#1a3f6f]">
                <Plus className="w-4 h-4" />
                <span>Créer un passeport</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => <PassportCard key={p.id} p={p} />)}
          </div>
        )}
      </main>

      {showForm && (
        <CompanyPassportForm
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); fetchPassports(); }}
        />
      )}
    </div>
  );
};

export default Passeport;
