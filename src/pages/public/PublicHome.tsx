import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import {
  ArrowRight, Shield, Globe, TrendingUp, Users, BookOpen,
  Briefcase, Building2, BarChart3, CheckCircle2, Star, MapPin
} from 'lucide-react';

const STATS = [
  { value: '2,847+', label: 'Entreprises certifiées' },
  { value: '15,892', label: 'Talents enregistrés' },
  { value: '1,234', label: 'Projets actifs' },
  { value: '42', label: 'Pays couverts' },
];

const MODULES = [
  { icon: Building2, title: 'Passeport Entreprise', desc: 'KYB automatisé avec score de confiance et certification blockchain', color: 'bg-blue-50 text-blue-600' },
  { icon: Briefcase, title: 'Sous-traitance', desc: 'Plateforme d\'appels d\'offres et de mise en relation industrielle', color: 'bg-green-50 text-green-600' },
  { icon: Shield, title: 'Identité Numérique', desc: 'Passeport numérique certifié pour entreprises et individus', color: 'bg-purple-50 text-purple-600' },
  { icon: Users, title: 'Gestion des Talents', desc: 'Annuaire de compétences industrielles vérifiées', color: 'bg-orange-50 text-orange-600' },
  { icon: BookOpen, title: 'Formation', desc: 'Catalogue de formations certifiantes pour les métiers industriels', color: 'bg-teal-50 text-teal-600' },
  { icon: BarChart3, title: 'Analytics IA', desc: 'Tableaux de bord intelligents pour décisions data-driven', color: 'bg-red-50 text-red-600' },
];

const TESTIMONIALS = [
  { name: 'Ahmed Benali', role: 'Directeur Achats, Total Energies DZ', text: 'INGI Synertran nous a permis de qualifier nos sous-traitants 3x plus rapidement. La certification blockchain est un vrai atout.', stars: 5 },
  { name: 'Chioma Okafor', role: 'CEO, Lagos Industrial Partners', text: 'La plateforme a révolutionné notre gestion des talents locaux. Nous avons réduit nos coûts RH de 40%.', stars: 5 },
  { name: 'Jean-Marc Thierry', role: 'Responsable Conformité, Eramet', text: 'Excellent outil pour le reporting ESG et le contenu local. Conforme aux exigences réglementaires africaines.', stars: 5 },
];

const PublicHome: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0D2B55] via-[#1a3f6f] to-[#0D2B55] text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-block px-3 py-1 bg-white/10 text-white/90 text-sm rounded-full mb-6 border border-white/20">
            🌍 Plateforme #1 de gouvernance industrielle en Afrique
          </span>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Gouvernance Industrielle
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-teal-300">
              Multi-Tenant & Multi-Régions
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Certifiez vos sous-traitants, gérez vos talents, suivez le contenu local et pilotez votre conformité ESG — le tout sur une seule plateforme SaaS.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/demo"
              className="flex items-center space-x-2 px-8 py-3.5 bg-white text-[#0D2B55] font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
            >
              <span>Demander une démo</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/signup"
              className="flex items-center space-x-2 px-8 py-3.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20"
            >
              <span>Commencer gratuitement</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-[#0D2B55]">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Une plateforme, 8 modules intégrés</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Chaque module est conçu pour répondre aux besoins spécifiques de l'industrie en Afrique et au Moyen-Orient</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULES.map(m => {
              const Icon = m.icon;
              return (
                <div key={m.title} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className={`p-3 rounded-xl w-fit mb-4 ${m.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{m.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{m.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="py-20 px-4 bg-[#0D2B55] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Pourquoi INGI Synertran ?</h2>
              <div className="space-y-4">
                {[
                  'Architecture multi-tenant avec isolation stricte des données',
                  'Certification blockchain pour chaque identité industrielle',
                  'Score de confiance IA pour évaluer vos partenaires',
                  'Conformité aux réglementations locales (contenu local, ESG)',
                  '15 langues, support RTL, multi-devises et multi-fuseaux',
                  'API ouverte et webhooks pour intégration ERP/SAP',
                ].map(item => (
                  <div key={item} className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-200">{item}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/features"
                className="inline-flex items-center space-x-2 mt-8 px-6 py-3 bg-white text-[#0D2B55] font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                <span>Voir toutes les fonctionnalités</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Globe, title: 'Multi-régions', desc: 'Déployé en Afrique, Moyen-Orient et Europe' },
                { icon: Shield, title: 'Sécurité maximale', desc: 'RLS, JWT, MFA, chiffrement AES-256' },
                { icon: TrendingUp, title: 'ROI prouvé', desc: 'Réduction des coûts de qualification de 60%' },
                { icon: MapPin, title: 'Expertise locale', desc: 'Conçu par et pour l\'industrie africaine' },
              ].map(card => {
                const Icon = card.icon;
                return (
                  <div key={card.title} className="bg-white/10 rounded-xl p-4 border border-white/10">
                    <Icon className="w-6 h-6 text-teal-400 mb-2" />
                    <p className="font-semibold text-white text-sm">{card.title}</p>
                    <p className="text-xs text-gray-300 mt-1">{card.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ce que disent nos clients</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gray-50 border-t border-gray-200">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Prêt à transformer votre gouvernance industrielle ?</h2>
          <p className="text-gray-500 mb-8">Rejoignez 2,847 entreprises qui font confiance à INGI Synertran</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/demo" className="flex items-center space-x-2 px-8 py-3.5 bg-[#0D2B55] text-white font-semibold rounded-xl hover:bg-[#1a3f6f] transition-colors">
              <span>Demander une démo gratuite</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/pricing" className="px-8 py-3.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
              Voir les tarifs
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PublicHome;
