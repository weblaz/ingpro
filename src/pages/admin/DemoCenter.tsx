import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import { supabase } from '../../supabase/client';
import { Monitor, Search, Mail, Building2, MapPin } from 'lucide-react';

interface DemoRequest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  organization: string;
  sector: string;
  country: string;
  company_size: string;
  message: string;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  demo_scheduled: 'bg-purple-100 text-purple-700',
  converted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
};

const STATUS_LABELS: Record<string, string> = {
  new: 'Nouveau',
  contacted: 'Contacté',
  demo_scheduled: 'Démo planifiée',
  converted: 'Converti',
  rejected: 'Rejeté',
};

const DemoCenter: React.FC = () => {
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    supabase.from('demo_requests').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setRequests(data || []); setLoading(false); });
  }, []);

  const filtered = requests.filter(r => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchSearch = `${r.first_name} ${r.last_name} ${r.organization} ${r.email}`.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('demo_requests').update({ status }).eq('id', id);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Monitor className="w-6 h-6 text-[#0D2B55]" /><span>Centre de Démonstrations</span>
          </h1>
          <p className="text-gray-500 mt-1">Gérez les demandes de démo et le pipeline commercial</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total demandes', value: requests.length, color: 'text-gray-900' },
            { label: 'Nouveaux', value: requests.filter(r => r.status === 'new').length, color: 'text-blue-600' },
            { label: 'Contactés', value: requests.filter(r => r.status === 'contacted').length, color: 'text-yellow-600' },
            { label: 'Démos planifiées', value: requests.filter(r => r.status === 'demo_scheduled').length, color: 'text-purple-600' },
            { label: 'Convertis', value: requests.filter(r => r.status === 'converted').length, color: 'text-green-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55] w-64" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]">
            <option value="all">Tous les statuts</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D2B55]"></div></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <Monitor className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune demande de démo</h3>
            <p className="text-gray-400 text-sm">Les demandes soumises depuis /demo apparaissent ici.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Contact</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Organisation</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Secteur / Pays</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Statut</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{r.first_name} {r.last_name}</p>
                        <p className="text-xs text-gray-500 flex items-center space-x-1"><Mail className="w-3 h-3" /><span>{r.email}</span></p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-900">{r.organization}</p>
                        <p className="text-xs text-gray-500">{r.company_size && `${r.company_size} employés`}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700">{r.sector}</p>
                        <p className="text-xs text-gray-500 flex items-center space-x-1"><MapPin className="w-3 h-3" /><span>{r.country}</span></p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-600'}`}>
                          {STATUS_LABELS[r.status] || r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <select
                          value={r.status}
                          onChange={e => updateStatus(r.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0D2B55]"
                        >
                          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DemoCenter;
