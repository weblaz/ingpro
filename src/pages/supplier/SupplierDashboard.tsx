import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/Header';
import {
  User, Briefcase, FileText, Award, ShoppingBag, Star, Shield,
  LogOut, MapPin, DollarSign, Calendar, ChevronRight, Building2,
  TrendingUp, AlertCircle,
} from 'lucide-react';

const NAV = [
  { label: 'Mon Profil', icon: User, section: 'profile' },
  { label: 'Appels d\'offres', icon: Briefcase, section: 'rfp', to: '/subcontracting' },
  { label: 'Mes Candidatures', icon: FileText, section: 'applications' },
  { label: 'Contrats actifs', icon: Award, section: 'contracts' },
  { label: 'Certifications', icon: Star, section: 'certs', to: '/passeport' },
  { label: 'Marketplace', icon: ShoppingBag, section: 'marketplace', to: '/marketplace' },
];

const PERMISSIONS = [
  'Voir les appels d\'offres', 'Soumettre des candidatures',
  'Gérer mon profil', 'Voir mes contrats',
  'Télécharger certifications', 'Marketplace fournisseurs',
];

const Skeleton = ({ w = 'w-full', h = 'h-4' }: { w?: string; h?: string }) => (
  <div className={`${w} ${h} bg-white/10 rounded animate-pulse`} />
);

interface SupplierStats {
  trustScore: number;
  openProjects: number;
  myPassports: any[];
}

const SupplierDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<SupplierStats>({ trustScore: 0, openProjects: 0, myPassports: [] });
  const [openProjects, setOpenProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [projRes, passRes] = await Promise.all([
          supabase.from('subcontracting_projects').select('id, project_title, industry, location, budget, deadline, status').eq('status', 'open').order('created_at', { ascending: false }).limit(5),
          user?.tenant
            ? supabase.from('company_passports').select('id, legal_name, trust_score, verification_status, country, industry').eq('tenant_id', user.tenant).limit(3)
            : Promise.resolve({ data: [] }),
        ]);

        const passports = (passRes as any).data || [];
        const avgTrust = passports.length ? Math.round(passports.reduce((s: number, p: any) => s + (p.trust_score || 0), 0) / passports.length) : 0;

        setStats({ trustScore: avgTrust, openProjects: projRes.data?.length || 0, myPassports: passports });
        setOpenProjects(projRes.data || []);
      } catch { setError('Erreur de chargement'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [user]);

  const kpis = [
    { label: 'Score de confiance', value: `${stats.trustScore}/100`, icon: Star, color: 'text-emerald-400', bg: 'bg-emerald-400/10', raw: true },
    { label: 'Candidatures soumises', value: 0, icon: FileText, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Contrats actifs', value: 0, icon: Award, color: 'text-teal-400', bg: 'bg-teal-400/10' },
    { label: 'Certifications valides', value: stats.myPassports.length, icon: Shield, color: 'text-lime-400', bg: 'bg-lime-400/10' },
  ];

  return (
    <div className="min-h-screen flex flex-col text-white" style={{ backgroundColor: '#0a1f0a' }}>
      <Header />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 border-r border-white/5 flex flex-col" style={{ backgroundColor: '#061306' }}>
          <div className="px-4 py-5 border-b border-white/5">
            <p className="text-xs text-emerald-400 uppercase tracking-widest font-medium">🏭 Espace Sous-traitant</p>
            <p className="text-sm font-semibold text-white mt-1 truncate">{user?.firstName} {user?.lastName}</p>
            <div className="flex items-center space-x-1 mt-1">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
              <span className="text-xs text-emerald-300">{stats.trustScore}/100</span>
            </div>
          </div>
          <nav className="flex-1 px-2 py-4 space-y-0.5">
            {NAV.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.section}
                  to={(item as any).to || '#'}
                  onClick={() => setActiveSection(item.section)}
                  className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${activeSection === item.section ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'text-emerald-200 hover:bg-white/5'}`}
                >
                  <span className="flex items-center space-x-2.5"><Icon className="w-4 h-4" /><span>{item.label}</span></span>
                  {(item as any).to && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
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
                <Building2 className="w-5 h-5 text-emerald-400" /><span>Espace Fournisseur & Sous-traitant</span>
              </h1>
              <p className="text-sm text-emerald-300 mt-0.5">Gérez vos appels d'offres, candidatures et certifications</p>
            </div>

            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-center space-x-2"><AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span></div>}

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {kpis.map(k => {
                const Icon = k.icon;
                return (
                  <div key={k.label} className="rounded-xl border border-white/5 p-4" style={{ backgroundColor: 'rgba(16,185,129,0.07)' }}>
                    <div className={`p-2 rounded-lg w-fit mb-3 ${k.bg}`}><Icon className={`w-5 h-5 ${k.color}`} /></div>
                    {loading && !('raw' in k) ? (
                      <><Skeleton h="h-7" w="w-16" /><Skeleton h="h-3" w="w-24" /></>
                    ) : (
                      <><p className="text-2xl font-bold text-white">{'raw' in k ? k.value : k.value}</p><p className="text-xs text-emerald-300 mt-0.5">{k.label}</p></>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              {/* Appels d'offres */}
              <div className="rounded-xl border border-white/5 p-5" style={{ backgroundColor: 'rgba(16,185,129,0.06)' }}>
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center justify-between">
                  <span className="flex items-center space-x-2"><Briefcase className="w-4 h-4 text-emerald-400" /><span>Appels d'offres ouverts</span></span>
                  <Link to="/subcontracting" className="text-xs text-emerald-400 hover:underline">Voir tous →</Link>
                </h3>
                {loading ? (
                  <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} h="h-14" />)}</div>
                ) : openProjects.length === 0 ? (
                  <div className="text-center py-8 text-emerald-400 text-sm">Aucun appel d'offres disponible</div>
                ) : (
                  <div className="space-y-3">
                    {openProjects.map(p => (
                      <div key={p.id} className="rounded-lg border border-white/5 p-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                        <p className="text-sm font-medium text-white mb-1">{p.project_title}</p>
                        <div className="flex items-center space-x-3 text-xs text-emerald-300">
                          <span className="flex items-center space-x-1"><MapPin className="w-3 h-3" /><span>{p.location}</span></span>
                          <span className="flex items-center space-x-1"><DollarSign className="w-3 h-3" /><span>${parseFloat(p.budget || '0').toLocaleString('fr-FR')}</span></span>
                          <span className="flex items-center space-x-1"><Calendar className="w-3 h-3" /><span>{new Date(p.deadline).toLocaleDateString('fr-FR')}</span></span>
                        </div>
                        <button className="mt-2 text-xs px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/30 transition-colors">
                          Candidater
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mon Passeport */}
              <div className="rounded-xl border border-white/5 p-5" style={{ backgroundColor: 'rgba(16,185,129,0.06)' }}>
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center justify-between">
                  <span className="flex items-center space-x-2"><Building2 className="w-4 h-4 text-emerald-400" /><span>Mon Passeport Entreprise</span></span>
                  <Link to="/passeport" className="text-xs text-emerald-400 hover:underline">Gérer →</Link>
                </h3>
                {loading ? (
                  <div className="space-y-3">{[...Array(2)].map((_, i) => <Skeleton key={i} h="h-20" />)}</div>
                ) : stats.myPassports.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="w-8 h-8 text-emerald-400/30 mx-auto mb-2" />
                    <p className="text-sm text-emerald-400 mb-3">Aucun passeport créé</p>
                    <Link to="/passeport" className="text-xs px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/30 transition-colors">
                      Créer mon passeport
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.myPassports.map(p => (
                      <div key={p.id} className="rounded-lg border border-white/5 p-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-medium text-white">{p.legal_name}</p>
                            <p className="text-xs text-emerald-300">{p.country} · {p.industry}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${p.verification_status === 'verified' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                            {p.verification_status === 'verified' ? '✓ Vérifié' : '⏳ En attente'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.trust_score}%` }} />
                          </div>
                          <span className="text-xs text-emerald-300 font-semibold">{p.trust_score}/100</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Permissions */}
            <div className="rounded-xl border border-white/5 p-5" style={{ backgroundColor: 'rgba(16,185,129,0.06)' }}>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-emerald-400" /><span>Permissions Fournisseur</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {PERMISSIONS.map(p => (
                  <span key={p} className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SupplierDashboard;
