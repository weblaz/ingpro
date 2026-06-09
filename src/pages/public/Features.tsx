import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Link } from 'react-router-dom';
import { Shield, Globe, Cpu, Link as LinkIcon, BarChart3, Lock, Zap, CheckCircle2 } from 'lucide-react';

const FEATURE_GROUPS = [
  {
    icon: Shield,
    title: 'KYB & Certification',
    features: ['Vérification automatique des registres commerciaux', 'Score de confiance basé sur 15 critères', 'Certification blockchain Ethereum', 'QR code de vérification instantanée', 'Suivi du statut de vérification en temps réel'],
  },
  {
    icon: Globe,
    title: 'Multi-régions & Localisation',
    features: ['15 langues dont arabe (RTL)', 'Multi-devises et fuseaux horaires', 'Conformité réglementaire par pays', 'Déploiement on-premise disponible', 'CDN mondial pour faible latence'],
  },
  {
    icon: Cpu,
    title: 'Intelligence Artificielle',
    features: ['Matching IA sous-traitants / donneurs d\'ordres', 'Score prédictif de fiabilité fournisseur', 'Détection d\'anomalies dans les dossiers', 'Recommandations de talents automatiques', 'Analytics prédictifs ESG'],
  },
  {
    icon: LinkIcon,
    title: 'Blockchain & Identité',
    features: ['Ancrage Ethereum pour chaque identité', 'Standards DID (Decentralized Identity)', 'Signature électronique qualifiée', 'Traçabilité immuable des transactions', 'Interopérabilité inter-plateformes'],
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reporting',
    features: ['Tableaux de bord en temps réel', 'Rapports ESG automatisés', 'Export PDF, Excel, CSV', 'KPIs personnalisables', 'Alertes et notifications intelligentes'],
  },
  {
    icon: Lock,
    title: 'Sécurité & Conformité',
    features: ['Row Level Security (RLS) Supabase', 'Chiffrement AES-256 au repos', 'MFA (authentification à deux facteurs)', 'Audit logs complets', 'Conformité GDPR + réglementations africaines'],
  },
];

const Features: React.FC = () => (
  <div className="min-h-screen bg-white">
    <Header />

    <section className="bg-gradient-to-br from-[#0D2B55] to-[#1a3f6f] text-white py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Fonctionnalités avancées</h1>
        <p className="text-xl text-gray-300">Technologies de pointe au service de la gouvernance industrielle africaine</p>
      </div>
    </section>

    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURE_GROUPS.map(g => {
            const Icon = g.icon;
            return (
              <div key={g.title} className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="p-3 bg-blue-50 rounded-xl w-fit mb-4">
                  <Icon className="w-6 h-6 text-[#0D2B55]" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{g.title}</h3>
                <ul className="space-y-2.5">
                  {g.features.map(f => (
                    <li key={f} className="flex items-start space-x-2.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>

    <section className="py-16 px-4 bg-gray-50 border-t border-gray-200">
      <div className="max-w-3xl mx-auto text-center">
        <Zap className="w-12 h-12 text-[#0D2B55] mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Intégrations disponibles</h2>
        <p className="text-gray-500 mb-8">INGI Synertran s'intègre avec vos outils existants via notre API REST et nos webhooks</p>
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {['SAP', 'Salesforce', 'Zapier', 'Slack', 'Microsoft Teams', 'Google Workspace', 'Oracle ERP', 'REST API'].map(tool => (
            <span key={tool} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium">{tool}</span>
          ))}
        </div>
        <Link to="/demo" className="inline-flex items-center space-x-2 px-8 py-3.5 bg-[#0D2B55] text-white font-semibold rounded-xl hover:bg-[#1a3f6f] transition-colors">
          <span>Voir une démo des intégrations</span>
        </Link>
      </div>
    </section>

    <Footer />
  </div>
);

export default Features;
