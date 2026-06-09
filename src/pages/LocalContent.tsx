import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { supabase } from '../supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { MapPin, Plus, X, Loader2, TrendingUp, Users, DollarSign } from 'lucide-react';

interface Project {
  id: string;
  project_name: string;
  company: string;
  country: string;
  industry: string;
  start_date: string;
  end_date: string;
  budget: number;
  local_content_rate: number;
  target_rate: number;
  local_jobs: number;
  local_suppliers: number;
  status: string;
}

const LocalContent: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newProject, setNewProject] = useState({
    project_name: '', company: '', country: 'Algérie', industry: 'Pétrole & Gaz',
    start_date: '', end_date: '', budget: '', local_content_rate: '0',
    target_rate: '30', local_jobs: '0', local_suppliers: '0',
  });

  const fetchProjects = async () => {
    if (!user?.tenant) return;
    const { data } = await supabase.from('local_content_projects').select('*').eq('tenant_id', user.tenant).order('created_at', { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tenant) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('local_content_projects').insert({
        tenant_id: user.tenant,
        project_name: newProject.project_name,
        company: newProject.company,
        country: newProject.country,
        industry: newProject.industry,
        start_date: newProject.start_date,
        end_date: newProject.end_date,
        budget: parseFloat(newProject.budget) || 0,
        local_content_rate: parseFloat(newProject.local_content_rate) || 0,
        target_rate: parseFloat(newProject.target_rate) || 30,
        local_jobs: parseInt(newProject.local_jobs) || 0,
        local_suppliers: parseInt(newProject.local_suppliers) || 0,
        status: 'active',
      });
      if (error) throw error;
      toast.success('Projet créé avec succès !');
      setShowProjectForm(false);
      fetchProjects();
    } catch (err: any) {
      toast.error(err.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const upd = (f: string, v: string) => setNewProject(p => ({ ...p, [f]: v }));

  const avgRate = projects.length > 0 ? Math.round(projects.reduce((s, p) => s + (p.local_content_rate || 0), 0) / projects.length) : 0;
  const totalJobs = projects.reduce((s, p) => s + (p.local_jobs || 0), 0);
  const totalSuppliers = projects.reduce((s, p) => s + (p.local_suppliers || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <MapPin className="w-6 h-6 text-[#0D2B55]" /><span>Contenu Local & ESG</span>
            </h1>
            <p className="text-gray-500 mt-1">Suivez et optimisez votre taux de contenu local</p>
          </div>
          <button onClick={() => setShowProjectForm(true)} className="flex items-center space-x-2 px-4 py-2.5 bg-[#0D2B55] text-white text-sm font-semibold rounded-xl hover:bg-[#1a3f6f] transition-colors">
            <Plus className="w-4 h-4" /><span>Nouveau projet</span>
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center"><p className="text-2xl font-bold text-gray-900">{projects.length}</p><p className="text-xs text-gray-500">Projets suivis</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center"><p className="text-2xl font-bold text-green-600">{avgRate}%</p><p className="text-xs text-gray-500">Taux moyen contenu local</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center"><p className="text-2xl font-bold text-blue-600">{totalJobs.toLocaleString()}</p><p className="text-xs text-gray-500">Emplois locaux créés</p></div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center"><p className="text-2xl font-bold text-purple-600">{totalSuppliers}</p><p className="text-xs text-gray-500">Fournisseurs locaux</p></div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D2B55]"></div></div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun projet de contenu local</h3>
            <p className="text-gray-400 mb-6 text-sm">Créez votre premier projet pour commencer à mesurer votre contenu local.</p>
            <button onClick={() => setShowProjectForm(true)} className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#0D2B55] text-white text-sm font-semibold rounded-xl hover:bg-[#1a3f6f]">
              <Plus className="w-4 h-4" /><span>Nouveau projet</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div><h3 className="font-semibold text-gray-900">{p.project_name}</h3><p className="text-xs text-gray-400">{p.company}</p></div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.status === 'active' ? 'Actif' : 'Terminé'}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                  <span>🌍 {p.country}</span><span>🏭 {p.industry}</span>
                  <span className="flex items-center space-x-1"><DollarSign className="w-3 h-3" /><span>${(p.budget || 0).toLocaleString()}</span></span>
                </div>
                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Contenu local</span>
                    <span className="font-semibold text-gray-900">{p.local_content_rate}% / {p.target_rate}% cible</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${p.local_content_rate >= p.target_rate ? 'bg-green-500' : 'bg-[#0D2B55]'}`}
                      style={{ width: `${Math.min(100, (p.local_content_rate / p.target_rate) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center space-x-1"><Users className="w-3 h-3" /><span>{p.local_jobs} emplois locaux</span></span>
                  <span className="flex items-center space-x-1"><TrendingUp className="w-3 h-3" /><span>{p.local_suppliers} fournisseurs locaux</span></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showProjectForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Nouveau projet de contenu local</h2>
              <button onClick={() => setShowProjectForm(false)} className="p-1.5 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Nom du projet *</label><input required value={newProject.project_name} onChange={e => upd('project_name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Entreprise *</label><input required value={newProject.company} onChange={e => upd('company', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Pays</label><input value={newProject.country} onChange={e => upd('country', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label><input type="number" value={newProject.budget} onChange={e => upd('budget', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Taux cible (%)</label><input type="number" min="0" max="100" value={newProject.target_rate} onChange={e => upd('target_rate', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Taux actuel (%)</label><input type="number" min="0" max="100" value={newProject.local_content_rate} onChange={e => upd('local_content_rate', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Emplois locaux</label><input type="number" min="0" value={newProject.local_jobs} onChange={e => upd('local_jobs', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Fournisseurs locaux</label><input type="number" min="0" value={newProject.local_suppliers} onChange={e => upd('local_suppliers', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date début</label><input type="date" value={newProject.start_date} onChange={e => upd('start_date', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label><input type="date" value={newProject.end_date} onChange={e => upd('end_date', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" /></div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setShowProjectForm(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">Annuler</button>
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#0D2B55] text-white text-sm font-medium rounded-lg hover:bg-[#1a3f6f] disabled:opacity-50">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}<span>{saving ? 'Création...' : 'Créer le projet'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocalContent;
