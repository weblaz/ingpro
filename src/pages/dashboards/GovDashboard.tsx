import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import {
  LayoutDashboard, FileText, BarChart3, Download, ShoppingCart,
  ShoppingBag, MapPin, Shield, LogOut, ChevronDown, ChevronRight,
  Globe, TrendingUp, Users, AlertCircle,
} from 'lucide-react';

const REGLEMENTATIONS = [
  { name: 'IKTVA', pays: 'Arabie Saoudite', taux: 70, statut: 'Actif' },
  { name: 'Contenu Local', pays: 'Algérie', taux: 51, statut: 'Actif' },
  { name: 'Nigerian Content Act', pays: 'Nigeria', taux: 45, statut: 'Actif' },
  { name: 'Contenu Local', pays: 'Sénégal', taux: 30, statut: 'Révision' },
  { name: 'ESG Reporting', pays: 'Union Européenne', taux: null, statut: 'Actif', detail: 'Obligatoire' },
];

const NAV_ITEMS = [
  { label: 'Vue d\'ensemble', icon: LayoutDashboard, section: 'overview' },
  { label: 'Réglementations', icon: FileText, section: 'reglementations' },
  { label: 'Analytics Nationaux', icon: BarChart3, section: 'analytics', to: '/analytics' },
  { label: 'Rapports', icon: Download, section: 'rapports' },
  {
    label: 'Marchés & Contrats', icon: ShoppingCart, section: 'marches',
    children: [
      { label: 'Appels d\'offres', to: '/subcontracting' },
      { label: 'Contrats', to: '/procurement' },
      { label: 'Workflow Validation', to: '/procurement' },
    ],
  },
  { label: 'Marketplace Opportunités', icon: ShoppingBag, section: 'marketplace', to: '/marketplace' },
];

const PERMISSIONS = [
  'Supervision contenu local', 'Indicateurs ESG nationaux',
  'Gestion réglementations', 'KPIs nationaux',
  'Export rapports réglementaires', 'Vue tous les tenants',
  'Analytics plateforme', 'Supervision sous-traitance',
];

const Skeleton = ({ w = 'w-full', h = 'h-4' }: { w?: string; h?: string }) => (
  <div className={`${w} ${h} bg-white/10 rounded animate-pulse`} />
);

interface GovStats {
  projets: number;
  avgLocalContent: number;
  esgIndicators: number;
  projetsConformes: number;
  totalJobs: number;
  totalSuppliers: number;
  totalBudget: number;
}

const GovDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<GovStats>({
    projets: 0, avgLocalContent: 0, esgIndicators: 0,
    projetsConformes: 0, totalJobs: 0, totalSuppliers: 0, totalBudget: 0,
  });

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [projRes, avgRes, esgRes, conformRes, jobsRes] = await Promise.all([
          supabase.from('local_content_projects').select('*', { count: 'exact', head: true }),
          supabase.from('local_content_projects').select('local_content_rate, local_jobs, local_suppliers, budget'),
          supabase.from('esg_indicators').select('*', { count: 'exact', head: true }),
          supabase.from('local_content_projects').select('*', { count: 'exact', head: true })
            .filter('local_content_rate', 'gte', 'target_rate'),
          supabase.from('talents').select('*', { count: 'exact', head: true }),
        ]);

        const rows = avgRes.data || [];
        const avgLC = rows.length ? Math.round(rows.reduce((s: number, r: any) => s + (r.local_content_rate || 0), 0) / rows.length) : 0;
        const totalJobs = rows.reduce((s: number, r: any) => s + (r.local_jobs || 0), 0);
        const totalSuppliers = rows.reduce((s: number, r: any) => s + (r.local_suppliers || 0), 0);
        const totalBudget = rows.reduce((s: number, r: any) => s + (parseFloat(r.budget) || 0), 0);

        setStats({
          projets: projRes.count || 0,
          avgLocalContent: avgLC,
          esgIndicators: esgRes.count || 0,
          projetsConformes: conformRes.count || 0,
          totalJobs,
          totalSuppliers,
          totalBudget,
        });
      } catch { setError('Erreur de chargement des données gouvernementales'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [user]);

  const toggleMenu = (s: string) => setOpenMenus(p => ({ ...p, [s]: !p[s] }));

  const kpis = [
    { label: 'Projets suivis', value: stats.projets, icon: MapPin, color: 'text-violet-400', bg: 'bg-violet-400/10' },
    { label: 'Taux moyen CL', value: `${stats.avgLocalContent}%`, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10', raw: true },
    { label: 'Indicateurs ESG', value: stats.esgIndicators, icon: Globe, color: 'text-violet-300', bg: 'bg-violet-300/10' },
    { label: 'Projets conformes', value: stats.projetsConformes, icon: Shield, color: 'text-green-400', bg: 'bg-green-400/10' },
  ];

  const kpiNationaux = [
    { label: 'Emplois locaux créés', value: stats.totalJobs, objectif: 5000, suffix: '' },
    { label: 'Fournisseurs locaux certifiés', value: stats.totalSuppliers, objectif: 200, suffix: '' },
    { label: 'Investissements locaux (M$)', value: Math.round(stats.totalBudget / 1_000_000), objectif: 500, suffix: 'M$' },
    { label: 'Taux de conformité ESG', value: stats.avgLocalContent, objectif: 100, suffix: '%' },
  ];

  return (
    <div className="min-h-screen flex flex-col text-white" style={{ backgroundColor: '#1a0a2e' }}>
      <Header />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 border-r border-white/5 flex flex-col" style={{ backgroundColor: '#120720' }}>
          <div className="px-4 py-5 border-b border-white/5">
            <p className="text-xs text-purple-400 uppercase tracking-widest font-medium">🏛️ Espace Gouvernement</p>
            <p className="text-sm font-semibold text-white mt-1 truncate">{user?.firstName} {user?.lastName}</p>
            <span className="inline-block mt-1 text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">Plan Government</span>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              return item.children ? (
                <div key={item.section}>
                  <button
                    onClick={() => toggleMenu(item.section)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-purple-200 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <span className="flex items-center space-x-2.5"><Icon className="w-4 h-4" /><span>{item.label}</span></span>
                    {openMenus[item.section] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                  {openMenus[item.section] && (
                    <div className="ml-6 mt-0.5 space-y-0.5">
                      {item.children.map(c => (
                        <Link key={c.label} to={c.to} className="block px-3 py-1.5 text-xs text-purple-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">{c.label}</Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.section}
                  to={(item as any).to || '#'}
                  onClick={() => setActiveSection(item.section)}
                  className={`flex items-center space-x-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${activeSection === item.section ? 'bg-purple-500/20 text-purple-300 font-medium' : 'text-purple-200 hover:bg-white/5'}`}
                >
                  <Icon className="w-4 h-4" /><span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="px-2 pb-4 border-t border-white/5 pt-3">
            <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center space-x-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" /><span>Déconnexion</span>
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-white flex items-center space-x-2">
                <Globe className="w-5 h-5 text-purple-400" /><span>Tableau de bord Gouvernemental</span>
              </h1>
              <p className="text-sm text-purple-300 mt-0.5">Supervision nationale — Contenu local & ESG</p>
            </div>

            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-center space-x-2"><AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span></div>}

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {kpis.map(k => {
                const Icon = k.icon;
                return (
                  <div key={k.label} className="rounded-xl border border-white/5 p-4" style={{ backgroundColor: 'rgba(139,92,246,0.08)' }}>
                    <div className={`p-2 rounded-lg w-fit mb-3 ${k.bg}`}><Icon className={`w-5 h-5 ${k.color}`} /></div>
                    {loading ? (
                      <><Skeleton h="h-7" w="w-16" /><Skeleton h="h-3" w="w-24" /></>
                    ) : (
                      <><p className="text-2xl font-bold text-white">{'raw' in k ? k.value : k.value}</p><p className="text-xs text-purple-300 mt-0.5">{k.label}</p></>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              {/* Réglementations */}
              <div className="rounded-xl border border-white/5 p-5" style={{ backgroundColor: 'rgba(139,92,246,0.06)' }}>
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-violet-400" /><span>Réglementations Actives</span>
                </h3>
                <div className="space-y-2.5">
                  {REGLEMENTATIONS.map(r => (
                    <div key={`${r.name}-${r.pays}`} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white font-medium">{r.name}</p>
                        <p className="text-xs text-purple-300">{r.pays}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {r.taux && <span className="text-xs font-bold text-violet-300">{r.taux}%</span>}
                        {r.detail && <span className="text-xs font-bold text-violet-300">{r.detail}</span>}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.statut === 'Actif' ? 'bg-green-500/15 text-green-400' : 'bg-orange-500/15 text-orange-400'}`}>
                          {r.statut}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* KPIs Nationaux */}
              <div className="rounded-xl border border-white/5 p-5" style={{ backgroundColor: 'rgba(139,92,246,0.06)' }}>
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-violet-400" /><span>KPIs Nationaux</span>
                </h3>
                <div className="space-y-4">
                  {kpiNationaux.map(k => {
                    const pct = Math.min(100, (k.value / k.objectif) * 100);
                    return (
                      <div key={k.label}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-purple-300">{k.label}</span>
                          <span className="text-white font-semibold">
                            {loading ? '—' : `${k.value.toLocaleString('fr-FR')}${k.suffix} / ${k.objectif.toLocaleString('fr-FR')}${k.suffix}`}
                          </span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          {!loading && <div className="h-full bg-purple-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="rounded-xl border border-white/5 p-5" style={{ backgroundColor: 'rgba(139,92,246,0.06)' }}>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-violet-400" /><span>Permissions Gouvernement</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {PERMISSIONS.map(p => (
                  <span key={p} className="text-xs bg-purple-500/15 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-full">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GovDashboard;
