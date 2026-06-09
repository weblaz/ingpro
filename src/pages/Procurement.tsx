import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SubcontractingForm from '../components/SubcontractingForm';
import { supabase } from '../supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, Plus, Search, MapPin, DollarSign, Calendar } from 'lucide-react';

const Procurement: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const fetchProjects = async () => {
    if (!user?.tenant) return;
    const { data } = await supabase.from('subcontracting_projects').select('*').eq('tenant_id', user.tenant).order('created_at', { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, [user]);

  const filtered = projects.filter(p => p.project_title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <ShoppingCart className="w-6 h-6 text-[#0D2B55]" /><span>Procurement</span>
            </h1>
            <p className="text-gray-500 mt-1">Gestion des achats et approvisionnements industriels</p>
          </div>
          <button onClick={() => setShowForm(true)} className="flex items-center space-x-2 px-4 py-2.5 bg-[#0D2B55] text-white text-sm font-semibold rounded-xl hover:bg-[#1a3f6f] transition-colors">
            <Plus className="w-4 h-4" /><span>Nouvelle demande</span>
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55] w-full sm:w-80" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D2B55]"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune demande d'achat</h3>
            <p className="text-gray-400 text-sm mb-6">Créez votre première demande de procurement.</p>
            <button onClick={() => setShowForm(true)} className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#0D2B55] text-white text-sm font-semibold rounded-xl hover:bg-[#1a3f6f]">
              <Plus className="w-4 h-4" /><span>Nouvelle demande</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-2">{p.project_title}</h3>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="flex items-center space-x-1"><MapPin className="w-3 h-3" /><span>{p.location}</span></span>
                  <span className="flex items-center space-x-1"><DollarSign className="w-3 h-3" /><span>${(p.budget || 0).toLocaleString()}</span></span>
                  <span className="flex items-center space-x-1"><Calendar className="w-3 h-3" /><span>{new Date(p.deadline).toLocaleDateString('fr-FR')}</span></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      {showForm && <SubcontractingForm onClose={() => setShowForm(false)} onSuccess={() => { setShowForm(false); fetchProjects(); }} />}
    </div>
  );
};

export default Procurement;
