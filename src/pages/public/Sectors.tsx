import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Link } from 'react-router-dom';
import { Flame, Mountain, Building, Leaf, Zap, Truck } from 'lucide-react';

const SECTORS = [
  {
    icon: Flame,
    name: 'Pétrole & Gaz',
    desc: 'Qualification des sous-traitants O&G, conformité HSE, gestion des contrats de services pétroliers et suivi du contenu local.',
    clients: ['Total Energies', 'Sonatrach', 'Aramco', 'Shell Africa'],
    useCases: ['Qualification fournisseurs Tier 1/2/3', 'Suivi contenu local O&G', 'Certification HSE fournisseurs'],
    color: 'bg-orange-50 border-orange-200',
    iconColor: 'bg-orange-100 text-orange-600',
  },
  {
    icon: Mountain,
    name: 'Mines & Métallurgie',
    desc: 'Gestion des prestataires miniers, conformité environnementale, suivi ESG et rapports pour les régulateurs miniers.',
    clients: ['Eramet', 'Glencore', 'AngloAmerican', 'Randgold'],
    useCases: ['Reporting ESG minier', 'Qualification sous-traitants miniers', 'Gestion des permis fournisseurs'],
    color: 'bg-gray-50 border-gray-200',
    iconColor: 'bg-gray-100 text-gray-600',
  },
  {
    icon: Building,
    name: 'BTP & Génie Civil',
    desc: 'Qualification des entreprises de construction, gestion de projets d\'infrastructure, suivi des talents et des formations.',
    clients: ['Colas Afrique', 'SOGEA-SATOM', 'Julius Berger', 'Razel-Bec'],
    useCases: ['Annuaire entreprises BTP certifiées', 'Gestion formations sécurité', 'Qualification sous-traitants chantier'],
    color: 'bg-yellow-50 border-yellow-200',
    iconColor: 'bg-yellow-100 text-yellow-600',
  },
  {
    icon: Leaf,
    name: 'Agriculture & Agroalimentaire',
    desc: 'Traçabilité de la chaîne d\'approvisionnement agricole, certification des fournisseurs et conformité aux standards internationaux.',
    clients: ['Olam International', 'Cargill Africa', 'Cocoa Alliance'],
    useCases: ['Traçabilité fournisseurs agricoles', 'Certification standards internationaux', 'Reporting développement durable'],
    color: 'bg-green-50 border-green-200',
    iconColor: 'bg-green-100 text-green-600',
  },
  {
    icon: Zap,
    name: 'Énergie & Utilités',
    desc: 'Gestion des prestataires du secteur énergétique, suivi des projets d\'énergie renouvelable et conformité réglementaire.',
    clients: ['Engie Africa', 'Enel Green Power', 'SNEL Congo'],
    useCases: ['Qualification installateurs solaires', 'Suivi projets EnR', 'Conformité réglementaire énergie'],
    color: 'bg-blue-50 border-blue-200',
    iconColor: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Truck,
    name: 'Transport & Logistique',
    desc: 'Certification des transporteurs, gestion de la flotte de sous-traitants logistiques et suivi des conformités.',
    clients: ['DHL Africa', 'Maersk', 'Bolloré Transport'],
    useCases: ['Certification transporteurs', 'Qualification prestataires logistiques', 'Suivi conformité transport'],
    color: 'bg-purple-50 border-purple-200',
    iconColor: 'bg-purple-100 text-purple-600',
  },
];

const Sectors: React.FC = () => (
  <div className="min-h-screen bg-white">
    <Header />

    <section className="bg-gradient-to-br from-[#0D2B55] to-[#1a3f6f] text-white py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">Secteurs industriels</h1>
        <p className="text-xl text-gray-300">Solutions verticalisées pour les grands secteurs de l'industrie africaine</p>
      </div>
    </section>

    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SECTORS.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.name} className={`rounded-2xl border p-6 ${s.color}`}>
              <div className={`p-3 rounded-xl w-fit mb-4 ${s.iconColor}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{s.name}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{s.desc}</p>
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Cas d'usage</p>
                <ul className="space-y-1">
                  {s.useCases.map(u => (
                    <li key={u} className="flex items-center space-x-2 text-xs text-gray-700">
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>{u}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Clients de référence</p>
                <div className="flex flex-wrap gap-1">
                  {s.clients.map(c => (
                    <span key={c} className="text-xs bg-white/70 border border-white px-2 py-0.5 rounded-full text-gray-600">{c}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>

    <section className="py-16 px-4 bg-[#0D2B55] text-white">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Votre secteur n'est pas listé ?</h2>
        <p className="text-gray-300 mb-8">INGI Synertran s'adapte à tous les secteurs industriels. Contactez-nous pour une démonstration personnalisée.</p>
        <Link to="/contact" className="inline-flex items-center space-x-2 px-8 py-3.5 bg-white text-[#0D2B55] font-semibold rounded-xl hover:bg-gray-100 transition-colors">
          <span>Nous contacter</span>
        </Link>
      </div>
    </section>

    <Footer />
  </div>
);

export default Sectors;
