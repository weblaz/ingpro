import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { supabase } from '../../supabase/client';
import { toast } from 'react-toastify';
import { CheckCircle2, Loader2, Calendar, Monitor, Users, ArrowRight } from 'lucide-react';

const SECTORS = ['Pétrole & Gaz', 'Mines & Métallurgie', 'BTP & Génie Civil', 'Agriculture', 'Énergie', 'Transport', 'Industrie manufacturière', 'Télécommunications', 'Santé', 'Finance', 'Gouvernement', 'Autre'];
const COUNTRIES = ['Algérie', 'Nigeria', 'Ghana', 'Côte d\'Ivoire', 'Sénégal', 'Cameroun', 'Maroc', 'Tunisie', 'Égypte', 'Arabie Saoudite', 'EAU', 'France', 'Autre'];
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '500-1000', '1000+'];

const Demo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    sector: '',
    country: '',
    companySize: '',
    message: '',
    consent: false,
  });

  const update = (f: string, v: any) => setForm(p => ({ ...p, [f]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consent) {
      toast.error('Veuillez accepter d\'être contacté');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('demo_requests').insert({
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        organization: form.organization,
        sector: form.sector,
        country: form.country,
        company_size: form.companySize,
        message: form.message,
        status: 'new',
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'envoi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="bg-gradient-to-br from-[#0D2B55] to-[#1a3f6f] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Demandez une démo gratuite</h1>
          <p className="text-xl text-gray-300">Découvrez comment INGI Synertran peut transformer votre gouvernance industrielle en 30 minutes</p>
        </div>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { icon: Calendar, title: 'Planifiez', desc: 'Choisissez un créneau adapté à votre agenda', step: '1' },
            { icon: Monitor, title: 'Découvrez', desc: 'Démonstration personnalisée de 30-45 min', step: '2' },
            { icon: Users, title: 'Démarrez', desc: 'Accès immédiat à votre espace d\'essai gratuit', step: '3' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
                <div className="w-10 h-10 bg-[#0D2B55] text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                  {s.step}
                </div>
                <Icon className="w-6 h-6 text-[#0D2B55] mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          {submitted ? (
            <div className="text-center py-16">
              <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Demande envoyée !</h2>
              <p className="text-gray-500 mb-4">Notre équipe vous contactera dans les <strong>24 heures</strong> pour planifier votre démonstration personnalisée.</p>
              <p className="text-sm text-gray-400 mb-8">En attendant, vous pouvez explorer la plateforme avec un compte de démonstration.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/login" className="flex items-center space-x-2 px-6 py-3 bg-[#0D2B55] text-white font-semibold rounded-xl hover:bg-[#1a3f6f] transition-colors">
                  <span>Accéder à la démo</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/" className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                  Retour à l'accueil
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Formulaire de demande de démo</h2>
                <p className="text-gray-500">Remplissez ce formulaire et nous vous recontactons dans les 24 heures</p>
              </div>
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-8 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                    <input required value={form.firstName} onChange={e => update('firstName', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                    <input required value={form.lastName} onChange={e => update('lastName', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email professionnel *</label>
                  <input required type="email" value={form.email} onChange={e => update('email', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organisation / Entreprise *</label>
                  <input required value={form.organization} onChange={e => update('organization', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Secteur *</label>
                    <select required value={form.sector} onChange={e => update('sector', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]">
                      <option value="">Sélectionner</option>
                      {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pays *</label>
                    <select required value={form.country} onChange={e => update('country', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]">
                      <option value="">Sélectionner</option>
                      {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Taille entreprise</label>
                    <select value={form.companySize} onChange={e => update('companySize', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]">
                      <option value="">Sélectionner</option>
                      {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employés</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message / Besoin spécifique</label>
                  <textarea rows={3} value={form.message} onChange={e => update('message', e.target.value)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="Décrivez brièvement votre besoin..." />
                </div>
                <label className="flex items-start space-x-2 cursor-pointer">
                  <input type="checkbox" checked={form.consent} onChange={e => update('consent', e.target.checked)} className="w-4 h-4 text-[#0D2B55] rounded mt-0.5" />
                  <span className="text-sm text-gray-600">J'accepte d'être contacté par l'équipe INGI Synertran concernant ma demande *</span>
                </label>
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center space-x-2 py-3.5 bg-[#0D2B55] text-white font-semibold rounded-xl hover:bg-[#1a3f6f] transition-colors disabled:opacity-50">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{loading ? 'Envoi...' : 'Demander ma démo gratuite'}</span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Demo;
