import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import DashboardCard from '../components/DashboardCard';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import {
  Building2, Briefcase, Users, BookOpen, BarChart3, MapPin,
  ArrowRight, Shield, TrendingUp, Globe
} from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();
  const { plan, hasAccess } = useSubscription();

  const modules = [
    { icon: Building2, title: 'Passeport Entreprise', desc: 'Certifiez vos partenaires', to: '/passeport', module: 'passeport', color: 'blue' as const },
    { icon: Briefcase, title: 'Sous-traitance', desc: 'Appels d\'offres & projets', to: '/subcontracting', module: 'subcontracting', color: 'green' as const },
    { icon: Shield, title: 'Identité Numérique', desc: 'Passeports certifiés blockchain', to: '/digital-identity', module: 'digital-identity', color: 'purple' as const },
    { icon: Users, title: 'Talents', desc: 'Annuaire de compétences', to: '/talents', module: 'talents', color: 'orange' as const },
    { icon: BookOpen, title: 'Formation', desc: 'Catalogue de formations', to: '/formation', module: 'formation', color: 'blue' as const },
    { icon: MapPin, title: 'Contenu Local & ESG', desc: 'Mesure du contenu local', to: '/local-content', module: 'local-content', color: 'green' as const },
    { icon: BarChart3, title: 'Analytics', desc: 'Tableaux de bord intelligents', to: '/analytics', module: 'analytics', color: 'purple' as const },
    { icon: Globe, title: 'Localisation', desc: 'Multi-langues & multi-régions', to: '/localization', module: 'localization', color: 'orange' as const },
  ];

  const accessibleModules = modules.filter(m => hasAccess(m.module));
  const lockedModules = modules.filter(m => !hasAccess(m.module));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {user?.firstName || 'Utilisateur'} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Plan actuel : <span className="font-semibold text-[#0D2B55] capitalize">{plan}</span>
            {plan !== 'government' && (
              <Link to="/upgrade" className="ml-3 text-sm text-blue-600 hover:underline font-medium">
                Mettre à niveau →
              </Link>
            )}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <DashboardCard title="Entreprises certifiées" value="2,847" icon={<Building2 className="w-5 h-5" />} trend={12} color="blue" />
          <DashboardCard title="Projets actifs" value="1,234" icon={<Briefcase className="w-5 h-5" />} trend={8} color="green" />
          <DashboardCard title="Talents enregistrés" value="15,892" icon={<Users className="w-5 h-5" />} trend={24} color="purple" />
          <DashboardCard title="Formations" value="456" icon={<BookOpen className="w-5 h-5" />} trend={5} color="orange" />
        </div>

        {/* Accessible modules */}
        {accessibleModules.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vos modules</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {accessibleModules.map(m => {
                const Icon = m.icon;
                return (
                  <Link
                    key={m.to}
                    to={m.to}
                    className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-[#0D2B55] transition-all group"
                  >
                    <div className="p-2.5 bg-blue-50 rounded-lg w-fit mb-3">
                      <Icon className="w-5 h-5 text-[#0D2B55]" />
                    </div>
                    <p className="font-semibold text-gray-900 group-hover:text-[#0D2B55] transition-colors">{m.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
                    <div className="flex items-center space-x-1 mt-3 text-xs text-[#0D2B55] opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Accéder</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Locked modules */}
        {lockedModules.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Modules disponibles avec un plan supérieur</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {lockedModules.map(m => {
                const Icon = m.icon;
                return (
                  <div key={m.to} className="bg-gray-100 rounded-xl border border-gray-200 p-5 opacity-60 relative overflow-hidden">
                    <div className="absolute top-2 right-2">
                      <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Verrouillé</span>
                    </div>
                    <div className="p-2.5 bg-gray-200 rounded-lg w-fit mb-3">
                      <Icon className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="font-semibold text-gray-500">{m.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center justify-center">
              <Link to="/upgrade" className="flex items-center space-x-2 px-6 py-2.5 bg-[#0D2B55] text-white text-sm font-semibold rounded-xl hover:bg-[#1a3f6f] transition-colors">
                <TrendingUp className="w-4 h-4" />
                <span>Débloquer tous les modules</span>
              </Link>
            </div>
          </div>
        )}

        {/* Quick links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/marketplace" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 rounded-lg"><TrendingUp className="w-5 h-5 text-indigo-600" /></div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Marketplace</p>
              <p className="text-xs text-gray-500">Trouver des partenaires</p>
            </div>
          </Link>
          <Link to="/collaboration" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-lg"><Users className="w-5 h-5 text-green-600" /></div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Collaboration</p>
              <p className="text-xs text-gray-500">Messagerie & documents</p>
            </div>
          </Link>
          <Link to="/billing" className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow flex items-center space-x-3">
            <div className="p-2 bg-orange-50 rounded-lg"><BarChart3 className="w-5 h-5 text-orange-600" /></div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Facturation</p>
              <p className="text-xs text-gray-500">Plan & factures</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Home;
