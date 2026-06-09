import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Building2, Briefcase, Shield, Users, BookOpen, BarChart3, MapPin, MessageSquare, ArrowRight } from 'lucide-react';

const SOLUTIONS = [
  {
    icon: Building2,
    title: 'Passeport Entreprise (KYB)',
    desc: 'Certifiez votre entreprise avec un passeport numérique infalsifiable. Score de confiance automatique basé sur vos données, blockchain Ethereum pour l\'ancrage, et QR code de vérification.',
    features: ['Certification blockchain', 'Score de confiance IA', 'QR Code de vérification', 'Dossier de conformité complet'],
    color: 'bg-blue-50 text-blue-600',
    plan: 'Starter',
  },
  {
    icon: Briefcase,
    title: 'Sous-traitance & Appels d\'offres',
    desc: 'Publiez vos appels d\'offres et trouvez les meilleurs sous-traitants locaux qualifiés. Matching IA basé sur les compétences, la localisation et le score de confiance.',
    features: ['Publication d\'appels d\'offres', 'Matching IA intelligent', 'Gestion des candidatures', 'Contrats numériques'],
    color: 'bg-green-50 text-green-600',
    plan: 'Starter',
  },
  {
    icon: Shield,
    title: 'Identité Numérique',
    desc: 'Créez des identités numériques certifiées pour vos entreprises et talents. Compatible avec les standards internationaux d\'identité décentralisée (DID).',
    features: ['Passeport individuel certifié', 'Vérification multi-niveaux', 'Portabilité des identités', 'Intégration blockchain'],
    color: 'bg-purple-50 text-purple-600',
    plan: 'Pro',
  },
  {
    icon: Users,
    title: 'Gestion des Talents',
    desc: 'Construisez et gérez un annuaire de talents industriels certifiés. Recrutement local simplifié avec profils vérifiés et scores de compétences.',
    features: ['Profils certifiés', 'Scores de compétences', 'Recherche multi-critères', 'Intégration formation'],
    color: 'bg-orange-50 text-orange-600',
    plan: 'Pro',
  },
  {
    icon: BookOpen,
    title: 'Formation & Certification',
    desc: 'Gérez votre catalogue de formations industrielles. Suivez les inscriptions, les progressions et délivrez des certificats numériques vérifiables.',
    features: ['Catalogue multi-format', 'Suivi des progressions', 'Certificats numériques', 'Intégration LMS'],
    color: 'bg-teal-50 text-teal-600',
    plan: 'Pro',
  },
  {
    icon: MapPin,
    title: 'Contenu Local & ESG',
    desc: 'Mesurez et optimisez votre taux de contenu local. Tableau de bord ESG complet pour répondre aux exigences réglementaires.',
    features: ['Calcul taux de contenu local', 'Indicateurs ESG', 'Rapports réglementaires', 'Suivi fournisseurs locaux'],
    color: 'bg-red-50 text-red-600',
    plan: 'Enterprise',
  },
];

const Solutions: React.FC = () => (
  <div className="min-h-screen bg-white">
    <Header />

    <section className="bg-gradient-to-br from-[#0D2B55] to-[#1a3f6f] text-white py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Nos Solutions Industrielles</h1>
        <p className="text-xl text-gray-300">6 modules intégrés pour couvrir l'ensemble de votre chaîne de valeur industrielle</p>
      </div>
    </section>

    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {SOLUTIONS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-8 items-center bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-md transition-shadow`}>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-3 rounded-xl ${s.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.plan === 'Starter' ? 'bg-blue-100 text-blue-700' : s.plan === 'Pro' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                    Plan {s.plan}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{s.title}</h2>
                <p className="text-gray-600 leading-relaxed mb-5">{s.desc}</p>
                <ul className="space-y-2">
                  {s.features.map(f => (
                    <li key={f} className="flex items-center space-x-2 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 bg-[#0D2B55] rounded-full flex-shrink-0"></span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`p-12 rounded-2xl ${s.color} flex items-center justify-center`}>
                <Icon className="w-24 h-24 opacity-30" />
              </div>
            </div>
          );
        })}
      </div>
    </section>

    <section className="py-16 px-4 bg-[#0D2B55] text-white">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Choisissez votre plan</h2>
        <p className="text-gray-300 mb-8">Des formules adaptées à chaque taille d'entreprise</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/pricing" className="flex items-center space-x-2 px-8 py-3.5 bg-white text-[#0D2B55] font-semibold rounded-xl hover:bg-gray-100 transition-colors">
            <span>Voir les tarifs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/demo" className="px-8 py-3.5 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors">
            Demander une démo
          </Link>
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default Solutions;
