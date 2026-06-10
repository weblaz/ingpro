import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import {
  LayoutDashboard, Building2, Users, BarChart3, Shield, Settings,
  Activity, Globe, Lock, AlertTriangle, CheckCircle2, LogOut, ChevronRight,
  Cpu, TrendingUp,
} from 'lucide-react';

const NAV = [
  { label: 'Vue d\'ensemble', icon: LayoutDashboard, section: 'overview' },
  { label: 'Tenants', icon: Building2, section: 'tenants', to: '/admin' },
  { label: 'Utilisateurs', icon: Users, section: 'users', to: '/admin' },
  { label: 'Analytics', icon: BarChart3, section: 'analytics', to: '/analytics' },
  { label: 'Sécurité', icon: Shield, section: 'security' },
  { label: 'Paramètres', icon: Settings, section: 'settings', to: '/admin' },
];

const REGIONS = [
  { name: 'Europe West', uptime: 99.98, latency: 12, tenants: 8 },
  { name: 'Middle East', uptime: 99.95, latency: 18, tenants: 14 },
  { name: 'North Africa', uptime: 99.97, latency: 8, tenants: 21 },
  { name: 'Africa West', uptime: 99.72, latency: 32, tenants: 6 },
  { name: 'Asia Pacific', uptime: 99.90, latency: 45, tenants: 3 },
];

const PERMISSIONS = [
  'Gestion de tous les tenants', 'Gestion de tous les utilisateurs',
  'Analytics plateforme complète', 'Configuration sécurité',
  'Déploiement multi-régions', 'Gestion des abonnements',
  'Audit complet', 'Accès à toutes les données',
];

const Skeleton = ({ w = 'w-full', h = 'h-4' }: { w?: string; h?: string }) => (
  <div className={`${w} ${h} bg-white/10 rounded animate-pulse`} />
);

const SuperAdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState({ tenants: 0, users: 0, demos: 0, pendingDemos: 0 });

  useEffect(() => {
    if (user?.role !== 'super_admin') { navigate('/dashboard', { replace: true }); return; }
    const fetch = async () => {
      setLoading(true);
      try {
        const [tRes, uRes, dRes, pdRes] = await Promise.all([
          supabase.from('tenants').select('*', { count: 'exact', head: true }),
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('demo_requests').select('*', { count: 'exact', head: true }),
          supabase.from('demo_requests').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        ]);
        setKpis({ tenants: tRes.count || 0, users: uRes.count || 0, demos: dRes.count || 0, pendingDemos: pdRes.count || 0 });
      } catch { setError('Erreur de chargement'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [user, navigate]);

  const kpiCards = [
    { label: 'Total Tenants', value: kpis.tenants, icon: Building2, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { label: 'Utilisateurs actifs', value: kpis.users, icon: Users, color: 'text-red-400', bg: 'bg-red-400/10' },
    { label: 'Revenus MRR', value: '$12,840', icon: TrendingUp, color: 'text-yellow-400', bg: 'bg-yellow-400/10', raw: true },
    { label: 'Uptime plateforme', value: '99.98%', icon: Activity, color: 'text-green-400', bg: 'bg-green-400/10', raw: true },
  ];

  const securityItems = [
    { label: 'Score de sécurité global', value: '87/100', ok: true },
    { label: 'RLS activé sur toutes les tables', value: '17/17', ok: true },
    { label: 'MFA activé', value: '24% des users', ok: false },
    { label: 'Alertes actives', value: `${kpis.pendingDemos} demandes en attente`, ok: kpis.pendingDemos === 0 },
    { label: 'Dernière migration', value: '09 Jun 2026', ok: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white">
      <Header />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 bg-gray-900 border-r border-white/5 flex flex-col">
          <div className="px-4 py-5 border-b border-white/5">
            <p className="text-xs text-red-400 uppercase tracking-widest font-medium">⚡ Super Admin</p>
            <p className="text-sm font-semibold text-white mt-1 truncate">{user?.firstName} {user?.lastName}</p>
            <span className="inline-block mt-1 text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Accès total plateforme</span>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-0.5">
            {NAV.map(item => {
              const Icon = item.icon;
              const El = item.to ? Link : 'button';
              return (
                <El
                  key={item.section}
                  {...(item.to ? { to: item.to } : {})}
                  onClick={() => setActiveSection(item.section)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${activeSection === item.section ? 'bg-red-500/15 text-red-400 font-medium' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                  <span className="flex items-center space-x-2.5"><Icon className="w-4 h-4" /><span>{item.label}</span></span>
                  {item.to && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                </El>
              );
            })}
          </nav>
          <div className="px-2 pb-4 border-t border-white/5 pt-3 space-y-0.5">
            <Link to="/admin/demo-center" className="flex items-center justify-between px-3 py-2 text-sm text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors">
              <span className="flex items-center space-x-2"><Activity className="w-4 h-4" /><span>Centre Démos</span></span>
              {kpis.pendingDemos > 0 && <span className="text-xs bg-orange-500 text-white rounded-full px-1.5 py-0.5">{kpis.pendingDemos}</span>}
            </Link>
            <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center space-x-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" /><span>Déconnexion</span>
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-white flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-red-400" />
                <span>Console Super Administrateur</span>
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">Vue globale et contrôle total de la plateforme INGI Synertran</p>
            </div>

            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">{error}</div>}

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {kpiCards.map(k => {
                const Icon = k.icon;
                return (
                  <div key={k.label} className="bg-white/5 rounded-xl border border-white/5 p-4">
                    <div className={`p-2 rounded-lg w-fit mb-3 ${k.bg}`}>
                      <Icon className={`w-5 h-5 ${k.color}`} />
                    </div>
                    {loading && !('raw' in k) ? (
                      <><Skeleton h="h-7" w="w-16" /><Skeleton h="h-3" w="w-24" /></>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-white">{'raw' in k ? k.value : k.value}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{k.label}</p>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              {/* Sécurité */}
              <div className="bg-white/5 rounded-xl border border-white/5 p-5">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-orange-400" /><span>Sécurité Plateforme</span>
                </h3>
                <div className="space-y-3">
                  {securityItems.map(s => (
                    <div key={s.label} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {s.ok
                          ? <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                          : <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0" />}
                        <span className="text-sm text-gray-300">{s.label}</span>
                      </div>
                      <span className={`text-xs font-semibold ${s.ok ? 'text-green-400' : 'text-orange-400'}`}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Régions */}
              <div className="bg-white/5 rounded-xl border border-white/5 p-5">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-orange-400" /><span>Déploiement Multi-Régions</span>
                </h3>
                <div className="space-y-2">
                  {REGIONS.map(r => (
                    <div key={r.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${r.uptime >= 99 ? 'bg-green-400' : 'bg-orange-400'}`} />
                        <span className="text-gray-300">{r.name}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs">
                        <span className={r.uptime >= 99 ? 'text-green-400' : 'text-orange-400'}>{r.uptime}%</span>
                        <span className="text-gray-500">{r.latency}ms</span>
                        <span className="text-gray-400">{r.tenants} tenants</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="bg-white/5 rounded-xl border border-white/5 p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-red-400" /><span>Permissions Super Admin</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {PERMISSIONS.map(p => (
                  <span key={p} className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
