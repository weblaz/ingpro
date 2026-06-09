import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import TrainingForm from '../components/TrainingForm';
import { supabase } from '../supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Plus, Search, Clock, Users, DollarSign, Calendar } from 'lucide-react';

interface Training {
  id: string;
  training_title: string;
  training_type: string;
  industry: string;
  duration: number;
  level: string;
  language: string;
  location: string;
  capacity: number;
  enrolled: number;
  price: number;
  start_date: string;
  status: string;
  description: string;
  created_at: string;
}

const LEVEL_COLORS: Record<string, string> = {
  'Débutant': 'bg-green-100 text-green-700',
  'Intermédiaire': 'bg-blue-100 text-blue-700',
  'Avancé': 'bg-orange-100 text-orange-700',
  'Expert': 'bg-red-100 text-red-700',
};

const Formation: React.FC = () => {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const fetchTrainings = async () => {
    if (!user?.tenant) return;
    const { data } = await supabase.from('trainings').select('*').eq('tenant_id', user.tenant).order('created_at', { ascending: false });
    setTrainings(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTrainings(); }, [user]);

  const filtered = trainings.filter(t =>
    t.training_title.toLowerCase().includes(search.toLowerCase()) ||
    t.industry.toLowerCase().includes(search.toLowerCase()) ||
    t.level.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-[#0D2B55]" />
              <span>Formation & Certification</span>
            </h1>
            <p className="text-gray-500 mt-1">Catalogue de formations industrielles certifiantes</p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center space-x-2 px-4 py-2.5 bg-[#0D2B55] text-white text-sm font-semibold rounded-xl hover:bg-[#1a3f6f] transition-colors">
            <Plus className="w-4 h-4" /><span>Publier une formation</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center"><p className="text-2xl font-bold text-gray-900">{trainings.length}</p><p className="text-xs text-gray-500">Formations publiées</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center"><p className="text-2xl font-bold text-green-600">{trainings.reduce((s, t) => s + (t.enrolled || 0), 0)}</p><p className="text-xs text-gray-500">Participants inscrits</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center"><p className="text-2xl font-bold text-blue-600">{trainings.filter(t => t.status === 'published').length}</p><p className="text-xs text-gray-500">Formations actives</p></div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une formation..." className="pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55] w-full sm:w-80" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D2B55]"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{trainings.length === 0 ? 'Aucune formation publiée' : 'Aucun résultat'}</h3>
            <p className="text-gray-400 mb-6 text-sm">Publiez votre premier programme de formation industrielle.</p>
            {trainings.length === 0 && (
              <button onClick={() => setShowForm(true)} className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#0D2B55] text-white text-sm font-semibold rounded-xl hover:bg-[#1a3f6f]">
                <Plus className="w-4 h-4" /><span>Publier une formation</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(t => (
              <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${LEVEL_COLORS[t.level] || 'bg-gray-100 text-gray-600'}`}>{t.level}</span>
                  <span className="text-xs text-gray-400">{t.training_type}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 leading-snug">{t.training_title}</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{t.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
                  <span className="flex items-center space-x-1"><Clock className="w-3 h-3" /><span>{t.duration}h</span></span>
                  <span className="flex items-center space-x-1"><Users className="w-3 h-3" /><span>{t.enrolled}/{t.capacity}</span></span>
                  <span className="flex items-center space-x-1"><Calendar className="w-3 h-3" /><span>{new Date(t.start_date).toLocaleDateString('fr-FR')}</span></span>
                  <span className="flex items-center space-x-1"><DollarSign className="w-3 h-3" /><span>${t.price}</span></span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{t.industry}</span>
                    <span className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full">{t.language}</span>
                  </div>
                  <button className="text-xs px-3 py-1.5 bg-[#0D2B55] text-white rounded-lg hover:bg-[#1a3f6f] transition-colors">
                    S'inscrire
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <TrainingForm onClose={() => setShowForm(false)} onSuccess={() => { setShowForm(false); fetchTrainings(); }} />
      )}
    </div>
  );
};

export default Formation;
