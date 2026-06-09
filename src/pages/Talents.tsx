import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import TalentForm from '../components/TalentForm';
import { supabase } from '../supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { Users, Plus, Search, MapPin, Briefcase, Star } from 'lucide-react';

interface Talent {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  country: string;
  job_title: string;
  experience: string;
  industry: string;
  skills: string[];
  availability: string;
  trust_score: number;
  created_at: string;
}

const Talents: React.FC = () => {
  const { user } = useAuth();
  const [talents, setTalents] = useState<Talent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const fetchTalents = async () => {
    if (!user?.tenant) return;
    const { data } = await supabase.from('talents').select('*').eq('tenant_id', user.tenant).order('created_at', { ascending: false });
    setTalents(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTalents(); }, [user]);

  const filtered = talents.filter(t =>
    `${t.first_name} ${t.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    t.job_title.toLowerCase().includes(search.toLowerCase()) ||
    t.industry.toLowerCase().includes(search.toLowerCase()) ||
    (t.skills || []).some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Users className="w-6 h-6 text-[#0D2B55]" />
              <span>Gestion des Talents</span>
            </h1>
            <p className="text-gray-500 mt-1">Annuaire de compétences industrielles certifiées</p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center space-x-2 px-4 py-2.5 bg-[#0D2B55] text-white text-sm font-semibold rounded-xl hover:bg-[#1a3f6f] transition-colors">
            <Plus className="w-4 h-4" /><span>Créer un profil</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center"><p className="text-2xl font-bold text-gray-900">{talents.length}</p><p className="text-xs text-gray-500">Talents enregistrés</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center"><p className="text-2xl font-bold text-green-600">{talents.filter(t => t.availability?.includes('immédiatement')).length}</p><p className="text-xs text-gray-500">Disponibles</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center"><p className="text-2xl font-bold text-blue-600">{talents.length > 0 ? Math.round(talents.reduce((s, t) => s + (t.trust_score || 0), 0) / talents.length) : 0}</p><p className="text-xs text-gray-500">Score moyen</p></div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom, poste, compétence..." className="pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55] w-full sm:w-80" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D2B55]"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{talents.length === 0 ? 'Aucun talent enregistré' : 'Aucun résultat'}</h3>
            <p className="text-gray-400 mb-6 text-sm">Ajoutez des profils de talents industriels à votre annuaire certifié.</p>
            {talents.length === 0 && (
              <button onClick={() => setShowForm(true)} className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#0D2B55] text-white text-sm font-semibold rounded-xl hover:bg-[#1a3f6f]">
                <Plus className="w-4 h-4" /><span>Créer un profil</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(t => (
              <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-[#0D2B55] rounded-full flex items-center justify-center text-white font-bold">
                    {t.first_name[0]}{t.last_name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{t.first_name} {t.last_name}</p>
                    <p className="text-xs text-gray-500">{t.job_title}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mb-3">
                  <span className="flex items-center space-x-1"><MapPin className="w-3 h-3" /><span>{t.country}</span></span>
                  <span className="flex items-center space-x-1"><Briefcase className="w-3 h-3" /><span>{t.experience}</span></span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {(t.skills || []).slice(0, 4).map(s => (
                    <span key={s} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                  {(t.skills || []).length > 4 && <span className="text-xs text-gray-400">+{(t.skills || []).length - 4}</span>}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-semibold text-gray-900">{t.trust_score}/100</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.availability?.includes('immédiatement') ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'}`}>
                    {t.availability?.includes('immédiatement') ? 'Disponible' : 'En poste'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <TalentForm onClose={() => setShowForm(false)} onSuccess={() => { setShowForm(false); fetchTalents(); }} />
      )}
    </div>
  );
};

export default Talents;
