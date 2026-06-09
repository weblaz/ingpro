import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Target, Eye, Heart, TrendingUp, Users, Globe, Award } from 'lucide-react';

const VALUES = [
  { icon: Target, title: 'Excellence', desc: 'Nous visons la perfection dans chaque fonctionnalité' },
  { icon: Heart, title: 'Impact local', desc: 'Développer l\'industrie africaine de l\'intérieur' },
  { icon: Globe, title: 'Inclusivité', desc: '15 langues, toutes les cultures industrielles' },
  { icon: Award, title: 'Confiance', desc: 'La transparence est au cœur de notre ADN' },
];

const TEAM = [
  { name: 'Moussa Diallo', role: 'CEO & Fondateur', bio: '20 ans d\'expérience dans l\'industrie pétrolière africaine' },
  { name: 'Amina Kherroubi', role: 'CTO', bio: 'Ex-ingénieure chez Sonatrach, experte en transformation digitale' },
  { name: 'Kwame Asante', role: 'Directeur Commercial', bio: 'Développement business en Afrique de l\'Ouest et au Ghana' },
  { name: 'Leila Mansouri', role: 'Directrice Produit', bio: 'Spécialiste SaaS B2B et UX pour l\'industrie' },
];

const About: React.FC = () => (
  <div className="min-h-screen bg-white">
    <Header />

    {/* Hero */}
    <section className="bg-gradient-to-br from-[#0D2B55] to-[#1a3f6f] text-white py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">À propos d'INGI Synertran</h1>
        <p className="text-xl text-gray-300 leading-relaxed">
          Nous construisons la colonne vertébrale numérique de l'industrie africaine — une plateforme de gouvernance qui connecte, certifie et optimise les écosystèmes industriels.
        </p>
      </div>
    </section>

    {/* Mission */}
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-5 h-5 text-[#0D2B55]" />
            <span className="text-sm font-semibold text-[#0D2B55] uppercase tracking-wider">Notre Mission</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Accélérer la transformation industrielle de l'Afrique</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            INGI Synertran est né d'un constat simple : les entreprises africaines manquent d'outils adaptés pour gérer leur conformité industrielle, qualifier leurs partenaires et valoriser leurs talents locaux.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Fondée en 2022, notre plateforme est aujourd'hui déployée dans 42 pays et sert plus de 2 800 entreprises dans les secteurs pétrolier, minier, construction et agriculture.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: '2022', label: 'Année de création' },
            { value: '42', label: 'Pays couverts' },
            { value: '2,847', label: 'Entreprises certifiées' },
            { value: '98%', label: 'Taux de satisfaction' },
          ].map(s => (
            <div key={s.label} className="bg-gray-50 rounded-2xl p-6 text-center">
              <p className="text-3xl font-bold text-[#0D2B55]">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos valeurs</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {VALUES.map(v => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="bg-white rounded-2xl p-6 text-center border border-gray-200">
                <div className="p-3 bg-blue-50 rounded-xl w-fit mx-auto mb-4">
                  <Icon className="w-6 h-6 text-[#0D2B55]" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>

    {/* Team */}
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">L'équipe dirigeante</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map(m => (
            <div key={m.name} className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
              <div className="w-16 h-16 bg-[#0D2B55] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                {m.name[0]}
              </div>
              <h3 className="font-semibold text-gray-900">{m.name}</h3>
              <p className="text-sm text-[#0D2B55] font-medium mb-2">{m.role}</p>
              <p className="text-xs text-gray-500">{m.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-16 px-4 bg-[#0D2B55] text-white">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Rejoignez l'écosystème INGI Synertran</h2>
        <p className="text-gray-300 mb-8">Faites partie des entreprises qui transforment l'industrie africaine</p>
        <Link to="/demo" className="inline-flex items-center space-x-2 px-8 py-3.5 bg-white text-[#0D2B55] font-semibold rounded-xl hover:bg-gray-100 transition-colors">
          <span>Demander une démo</span>
        </Link>
      </div>
    </section>

    <Footer />
  </div>
);

export default About;
