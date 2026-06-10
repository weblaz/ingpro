import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import {
  Building2, Briefcase, Users, BookOpen, BarChart3, MapPin,
  ShoppingCart, ShoppingBag, TrendingUp, Activity, Clock,
  FileText, ChevronDown, ChevronRight, LogOut, Settings, Shield,
} from 'lucide-react';

// ── Sidebar ────────────────────────────────────────────────────────────────
type NavItem = { label: string; icon: React.ElementType; section: string; to?: string; children?: { label: string; to: string }[] };

const NAV: NavItem[] = [
  { label: 'Passeport Entreprise', icon: Building2, section: 'passeport', to: '/passeport' },
  { label: 'Sous-traitance', icon: Briefcase, section: 'subcontracting', to: '/subcontracting' },
  { label: 'Talents', icon: Users, section: 'talents', to: '/talents' },
  { label: 'Analytics', icon: BarChart3, section: 'analytics', to: '/analytics' },
  { label: 'ESG & Contenu Local', icon: MapPin, section: 'local-content', to: '/local-content' },
  {
    label: 'Achats & Contrats', icon: ShoppingCart, section: 'procurement',
    children: [
      { label: 'Vue d\'ensemble', to: '/procurement' },
      { label: 'RFI', to: '/procurement' },
      { label: 'RFQ', to: '/procurement' },
      { label: 'RFP', to: '/procurement' },
      { label: 'Appels d\'offres', to: '/subcontracting' },
      { label: 'Workflow Validation', to: '/procurement' },
    ],
  },
  {
    label: 'Marketplaces', icon: ShoppingBag, section: 'marketplace',
    children: [
      { label: 'Fournisseurs', to: '/marketplace' },
      { label: 'Talents', to: '/talents' },
    ],
  },
];

interface Stats {
  passports: number;
  openProjects: number;
  availableTalents: number;
  activeTrainings: number;
  avgTrustScore: number;
  avgLocalContent: number;
  recentActivity: { type: string; label: string; time: string; color: string }[];
}

const Skeleton = ({ w = 'w-full', h = 'h-4' }: { w?: string; h?: string }) => (
  <div className={`${w} ${h} bg-white/10 rounded animate-pulse`} />
);

const EnterpriseDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('passeport');
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    passports: 0, openProjects: 0, availableTalents: 0, activeTrainings: 0,
    avgTrustScore: 0, avgLocalContent: 0, recentActivity: [],
  });

  useEffect(() => {
    if (!user?.tenant) return;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          passRes, projRes, talRes, trainRes,
          trustRes, localRes,
          recentPass, recentProj, recentTal, recentTrain,
        ] = await Promise.all([
          supabase.from('company_passports').select('*', { count: 'exact', head: true }).eq('tenant_id', user.tenant),
          supabase.from('subcontracting_projects').select('*', { count: 'exact', head: true }).eq('tenant_id', user.tenant).eq('status', 'open'),
          supabase.from('talents').select('*', { count: 'exact', head: true }).eq('tenant_id', user.tenant),
          supabase.from('trainings').select('*', { count: 'exact', head: true }).eq('tenant_id', user.tenant).eq('status', 'published'),
          supabase.from('company_passports').select('trust_score').eq('tenant_id', user.tenant),
          supabase.from('local_content_projects').select('local_content_rate').eq('tenant_id', user.tenant),
          supabase.from('company_passports').select('legal_name, created_at').eq('tenant_id', user.tenant).order('created_at', { ascending: false }).limit(2),
          supabase.from('subcontracting_projects').select('project_title, created_at').eq('tenant_id', user.tenant).order('created_at', { ascending: false }).limit(2),
          supabase.from('talents').select('first_name, last_name, created_at').eq('tenant_id', user.tenant).order('created_at', { ascending: false }).limit(1),
          supabase.from('trainings').select('training_title, created_at').eq('tenant_id', user.tenant).order('created_at', { ascending: false }).limit(1),
        ]);

        const scores = (trustRes.data || []).map((r: any) => r.trust_score).filter(Boolean);
        const avgTrust = scores.length ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;
        const rates = (localRes.data || []).map((r: any) => r.local_content_rate).filter(Boolean);
        const avgLocal = rates.length ? Math.round(rates.reduce((a: number, b: number) => a + b, 0) / rates.length) : 0;

        const timeAgo = (d: string) => {
          const diff = Date.now() - new Date(d).getTime();
          const h = Math.floor(diff / 3600000);
          if (h < 1) return 'il y a quelques min';
          if (h < 24) return `il y a ${h}h`;
          return `il y a ${Math.floor(h / 24)}j`;
        };

        const activity: Stats['recentActivity'] = [
          ...(recentPass.data || []).map((p: any) => ({ type: 'passport', label: `Passeport créé : ${p.legal_name}`, time: timeAgo(p.created_at), color: 'bg-green-400' })),
          ...(recentProj.data || []).map((p: any) => ({ type: 'project', label: `Projet publié : ${p.project_title}`, time: timeAgo(p.created_at), color: 'bg-blue-400' })),
          ...(recentTal.data || []).map((t: any) => ({ type: 'talent', label: `Talent ajouté : ${t.first_name} ${t.last_name}`, time: timeAgo(t.created_at), color: 'bg-orange-400' })),
          ...(recentTrain.data || []).map((t: any) => ({ type: 'training', label: `Formation publiée : ${t.training_title}`, time: timeAgo(t.created_at), color: 'bg-purple-400' })),
        ].sort((a, b) => a.time.localeCompare(b.time)).slice(0, 5);

        setStats({
          passports: passRes.count || 0,
          openProjects: projRes.count || 0,
          availableTalents: talRes.count || 0,
          activeTrainings: trainRes.count || 0,
          avgTrustScore: avgTrust,
          avgLocalContent: avgLocal,
          recentActivity: activity,
        });
      } catch (e: any) {
        setError('Erreur de chargement des données.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

  const toggleMenu = (section: string) => setOpenMenus(p => ({ ...p, [section]: !p[section] }));

  const kpis = [
    { label: 'Passeports créés', value: stats.passports, icon: Building2, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    { label: 'Projets ouverts', value: stats.openProjects, icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Talents disponibles', value: stats.availableTalents, icon: Users, color: 'text-violet-400', bg: 'bg-violet-400/10' },
    { label: 'Formations actives', value: stats.activeTrainings, icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  const permissions = [
    'Gestion passeports', 'Sous-traitance', 'Gestion talents',
    'Formations', 'ESG & Contenu local', 'Analytics avancés',
    'Achats & Contrats', 'Marketplace fournisseurs',
  ];

  const performance = [
    { label: 'Score de confiance', value: stats.avgTrustScore, color: 'bg-blue-500', max: 100 },
    { label: 'Taux de contenu local', value: stats.avgLocalContent, color: 'bg-emerald-500', max: 100 },
    { label: 'Passeports vérifiés', value: Math.min(stats.passports * 10, 85), color: 'bg-violet-500', max: 100 },
    { label: 'Satisfaction fournisseurs', value: 72, color: 'bg-orange-500', max: 100 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white">
      <Header />
      <div className="flex flex-1">
        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <aside className="w-64 flex-shrink-0 bg-blue-950 border-r border-white/5 flex flex-col">
          <div className="px-4 py-5 border-b border-white/5">
            <p className="text-xs text-blue-300 uppercase tracking-widest font-medium">Espace Entreprise</p>
            <p className="text-sm font-semibold text-white mt-1 truncate">{user?.firstName} {user?.lastName}</p>
            <span className="inline-block mt-1 text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full capitalize">{user?.plan}</span>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
            {NAV.map(item => {
              const Icon = item.icon;
              return item.children ? (
                <div key={item.section}>
                  <button
                    onClick={() => toggleMenu(item.section)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-blue-200 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <span className="flex items-center space-x-2.5"><Icon className="w-4 h-4" /><span>{item.label}</span></span>
                    {openMenus[item.section] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                  {openMenus[item.section] && (
                    <div className="ml-6 mt-0.5 space-y-0.5">
                      {item.children.map(c => (
                        <Link key={c.label} to={c.to} className="block px-3 py-1.5 text-xs text-blue-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.section}
                  to={item.to || '#'}
                  onClick={() => setActiveSection(item.section)}
                  className={`flex items-center space-x-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${activeSection === item.section ? 'bg-blue-500/20 text-blue-300 font-medium' : 'text-blue-200 hover:bg-white/5'}`}
                >
                  <Icon className="w-4 h-4" /><span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="px-2 pb-4 border-t border-white/5 pt-3">
            <Link to="/billing" className="flex items-center space-x-2.5 px-3 py-2 text-sm text-blue-300 hover:bg-white/5 rounded-lg transition-colors">
              <Settings className="w-4 h-4" /><span>Facturation & Plan</span>
            </Link>
            <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center space-x-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mt-0.5">
              <LogOut className="w-4 h-4" /><span>Déconnexion</span>
            </button>
          </div>
        </aside>

        {/* ── Main ────────────────────────────────────────────────────── */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-white">Tableau de bord Enterprise</h1>
              <p className="text-sm text-blue-300 mt-0.5">Vue d'ensemble de votre organisation</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">{error}</div>
            )}

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {kpis.map(k => {
                const Icon = k.icon;
                return (
                  <div key={k.label} className="bg-white/5 rounded-xl border border-white/5 p-4">
                    <div className={`p-2 rounded-lg w-fit mb-3 ${k.bg}`}>
                      <Icon className={`w-5 h-5 ${k.color}`} />
                    </div>
                    {loading ? (
                      <><Skeleton h="h-7" w="w-16" /><Skeleton h="h-3" w="w-24" /></>
                    ) : (
                      <><p className="text-2xl font-bold text-white">{k.value}</p><p className="text-xs text-blue-300 mt-0.5">{k.label}</p></>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              {/* Performance */}
              <div className="bg-white/5 rounded-xl border border-white/5 p-5">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" /><span>Performance Entreprise</span>
                </h3>
                <div className="space-y-4">
                  {performance.map(p => (
                    <div key={p.label}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-blue-300">{p.label}</span>
                        <span className="text-white font-semibold">{loading ? '—' : `${p.value}%`}</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        {!loading && (
                          <div className={`h-full rounded-full transition-all duration-700 ${p.color}`} style={{ width: `${Math.min(p.value, 100)}%` }} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/5 rounded-xl border border-white/5 p-5">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-cyan-400" /><span>Activité Récente</span>
                </h3>
                {loading ? (
                  <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} h="h-8" />)}</div>
                ) : stats.recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-blue-400 text-sm">Aucune activité récente</div>
                ) : (
                  <div className="space-y-3">
                    {stats.recentActivity.map((a, i) => (
                      <div key={i} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{a.label}</p>
                          <p className="text-xs text-blue-400 flex items-center space-x-1 mt-0.5">
                            <Clock className="w-3 h-3" /><span>{a.time}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Permissions */}
            <div className="bg-white/5 rounded-xl border border-white/5 p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-cyan-400" /><span>Permissions Enterprise</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {permissions.map(p => (
                  <span key={p} className="text-xs bg-blue-500/15 text-blue-300 border border-blue-500/20 px-2.5 py-1 rounded-full">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EnterpriseDashboard;
