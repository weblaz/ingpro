import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { supabase } from '../../supabase/client';
import { toast } from 'react-toastify';
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2 } from 'lucide-react';

const Contact: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('contact_messages').insert({
        name: form.name,
        email: form.email,
        company: form.company || null,
        message: form.message,
        status: 'new',
      });
      if (error) throw error;
      setSent(true);
      toast.success('Message envoyé avec succès !');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'envoi du message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="bg-gradient-to-br from-[#0D2B55] to-[#1a3f6f] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contactez-nous</h1>
          <p className="text-xl text-gray-300">Notre équipe vous répond dans les 24 heures</p>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Parlons de votre projet</h2>
            {sent ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Message envoyé !</h3>
                <p className="text-gray-500">Notre équipe vous contactera dans les 24 heures.</p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', company: '', message: '' }); }}
                  className="mt-6 text-sm text-[#0D2B55] hover:underline font-medium"
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                    <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="Ahmed Benali" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="ahmed@entreprise.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
                  <input value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="Nom de votre entreprise" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                  <textarea required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" placeholder="Décrivez votre besoin..." />
                </div>
                <button type="submit" disabled={loading} className="flex items-center space-x-2 px-6 py-3 bg-[#0D2B55] text-white text-sm font-semibold rounded-xl hover:bg-[#1a3f6f] transition-colors disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{loading ? 'Envoi...' : 'Envoyer le message'}</span>
                </button>
              </form>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nos bureaux</h3>
              <div className="space-y-4">
                {[
                  { city: 'Alger', country: 'Algérie', address: 'Rue des Frères Bouadou, Bir Mourad Raïs', phone: '+213 21 XX XX XX' },
                  { city: 'Lagos', country: 'Nigeria', address: 'Victoria Island, Lagos', phone: '+234 1 XXX XXXX' },
                  { city: 'Paris', country: 'France', address: '75 Avenue des Champs-Élysées, Paris 8e', phone: '+33 1 XX XX XX XX' },
                ].map(o => (
                  <div key={o.city} className="bg-gray-50 rounded-xl p-4">
                    <p className="font-semibold text-gray-900">{o.city}, {o.country}</p>
                    <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{o.address}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{o.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#0D2B55] rounded-xl p-5 text-white">
              <Mail className="w-6 h-6 text-teal-400 mb-3" />
              <h4 className="font-semibold mb-1">Email direct</h4>
              <a href="mailto:contact@ingi-synertran.com" className="text-teal-300 hover:text-white transition-colors text-sm">
                contact@ingi-synertran.com
              </a>
              <p className="text-gray-400 text-xs mt-2">Réponse garantie sous 24h ouvrées</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;