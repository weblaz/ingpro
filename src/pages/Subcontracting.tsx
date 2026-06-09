import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SubcontractingForm from '../components/SubcontractingForm';
import { supabase } from '../supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, Plus, Search, MapPin, DollarSign, Calendar, Users } from 'lucide-react';

interface Project {
  id: string;
  project_title: string;
  project_type: string;
  industry: string;
  location: string;
  budget: number;
  deadline: string;
  status: string;
  applications_count: number;
  description: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-purple-100 text-purple-700',
};

const Subcontracting: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchProjects = async () => {
    if (!user?.tenant) return;
    const { data } = await supabase
      .from('subcontracting_projects')
      .select('*')
      .eq('tenant_id', user.tenant)
      .order('created_at', { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, [user]);

  const filtered = projects.filter(p => {
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchSearch = p.project_title.toLowerCase().includes(search.toLowerCase()) ||
      p.industry.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <Briefcase className="w-6 h-6 text-[#0D2B55]" />
              <span>Sous-traitance</span>
            </h1>
            <p className="text-gray-500 mt-1">Gérez vos appels d'offres et vos projets de sous-traitance</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-[#0D2B55] text-white text-sm font-semibold rounded-xl hover:bg-[#1a3f6f] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Publier un appel d'offres</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total projets', value: projects.length, color: 'text-gray-900' },
            { label: 'Ouverts', value: projects.filter(p => p.status === 'open').length, color: 'text-green-600' },
            { label: 'En cours', value: projects.filter(p => p.status === 'in_progress').length, color: 'text-blue-600' },
            { label: 'Terminés', value: projects.filter(p => p.status === 'completed').length, color: 'text-purple-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55] w-64" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]">
            <option value="all">Tous les statuts</option>
            <option value="open">Ouvert</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminé</option>
            <option value="closed">Fermé</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D2B55]"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{projects.length === 0 ? 'Aucun projet publié' : 'Aucun résultat'}</h3>
            <p className="text-gray-400 mb-6 text-sm">Publiez votre premier appel d'offres pour trouver des sous-traitants qualifiés.</p>
            {projects.length === 0 && (
              <button onClick={() => setShowForm(true)} className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#0D2B55] text-white text-sm font-semibold rounded-xl hover:bg-[#1a3f6f]">
                <Plus className="w-4 h-4" /><span>Publier un appel d'offres</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 flex-1 pr-2">{p.project_title}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-600'}`}>
                    {p.status === 'open' ? 'Ouvert' : p.status === 'in_progress' ? 'En cours' : p.status === 'completed' ? 'Terminé' : 'Fermé'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
                  <span className="flex items-center space-x-1"><MapPin className="w-3 h-3" /><span>{p.location}</span></span>
                  <span className="flex items-center space-x-1"><DollarSign className="w-3 h-3" /><span>${p.budget?.toLocaleString()}</span></span>
                  <span className="flex items-center space-x-1"><Calendar className="w-3 h-3" /><span>{new Date(p.deadline).toLocaleDateString('fr-FR')}</span></span>
                  <span className="flex items-center space-x-1"><Users className="w-3 h-3" /><span>{p.applications_count} candidatures</span></span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2">{p.description}</p>
                <div className="flex items-center space-x-2 mt-3">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{p.project_type}</span>
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{p.industry}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <SubcontractingForm
          onClose={() => setShowForm(false)}
          onSuccess={() => { setShowForm(false); fetchProjects(); }}
        />
      )}
    </div>
  );
};

export default Subcontracting;
