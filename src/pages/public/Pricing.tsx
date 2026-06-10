import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabase/client';
import { toast } from 'react-toastify';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { PLANS } from '../../types/subscription';

const Pricing: React.FC = () => {
  const { user } = useAuth();
  const [billing, setBilling] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    if (!user) {
      window.location.href = '/signup';
      return;
    }
    // Tous les changements de plan passent par notre équipe commerciale
    // pour validation du paiement avant activation
    const planNames: Record<string, string> = {
      starter: 'Starter', pro: 'Pro', enterprise: 'Enterprise', government: 'Government',
    };
    const planName = planNames[planId] || planId;
    toast.info(
      `Demande de passage au plan ${planName} enregistrée. Notre équipe vous contactera sous 24h pour finaliser votre upgrade.`,
      { autoClose: 6000 }
    );
    window.location.href = `/contact?plan=${planId}&billing=${billing}&upgrade=1`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="bg-gradient-to-br from-[#0D2B55] to-[#1a3f6f] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Tarifs transparents</h1>
          <p className="text-xl text-gray-300 mb-8">Choisissez le plan adapté à votre entreprise. Sans surprise.</p>

          {/* Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={`text-sm font-medium ${billing === 'monthly' ? 'text-white' : 'text-gray-400'}`}>Mensuel</span>
            <button
              onClick={() => setBilling(billing === 'monthly' ? 'annual' : 'monthly')}
              className={`relative w-12 h-6 rounded-full transition-colors ${billing === 'annual' ? 'bg-teal-400' : 'bg-gray-500'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${billing === 'annual' ? 'translate-x-6' : ''}`}></span>
            </button>
            <span className={`text-sm font-medium ${billing === 'annual' ? 'text-white' : 'text-gray-400'}`}>
              Annuel <span className="text-teal-300 ml-1">−17%</span>
            </span>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 -mt-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map(plan => {
              const price = billing === 'annual' ? plan.annualPrice : plan.monthlyPrice;
              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl border-2 p-6 flex flex-col ${plan.highlight ? 'border-[#0D2B55] shadow-xl bg-[#0D2B55] text-white' : 'border-gray-200 bg-white'}`}
                >
                  {plan.highlight && (
                    <span className="text-xs font-semibold bg-teal-400 text-[#0D2B55] px-2.5 py-1 rounded-full w-fit mb-3">
                      ⭐ Populaire
                    </span>
                  )}
                  <h3 className={`text-xl font-bold mb-2 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                  <p className={`text-sm mb-4 ${plan.highlight ? 'text-gray-300' : 'text-gray-500'}`}>{plan.description}</p>

                  <div className="mb-6">
                    {plan.monthlyPrice === 0 ? (
                      <p className={`text-3xl font-bold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>Sur devis</p>
                    ) : (
                      <>
                        <p className={`text-3xl font-bold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                          ${price}
                          <span className={`text-sm font-normal ${plan.highlight ? 'text-gray-300' : 'text-gray-500'}`}>/mois</span>
                        </p>
                        {billing === 'annual' && (
                          <p className={`text-xs mt-1 ${plan.highlight ? 'text-teal-300' : 'text-green-600'}`}>
                            Facturation annuelle (${price * 12}/an)
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <ul className="space-y-2.5 flex-1 mb-6">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start space-x-2">
                        <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? 'text-teal-400' : 'text-green-500'}`} />
                        <span className={`text-sm ${plan.highlight ? 'text-gray-200' : 'text-gray-600'}`}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loading === plan.id}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
                      plan.highlight
                        ? 'bg-white text-[#0D2B55] hover:bg-gray-100'
                        : plan.id === 'government'
                        ? 'bg-gray-900 text-white hover:bg-gray-800'
                        : 'bg-[#0D2B55] text-white hover:bg-[#1a3f6f]'
                    } disabled:opacity-50`}
                  >
                    {loading === plan.id ? 'Activation...' : plan.id === 'government' ? 'Nous contacter' : user ? 'Choisir ce plan' : 'Commencer'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-gray-50 border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Questions fréquentes</h2>
          <div className="space-y-4">
            {[
              { q: 'Puis-je changer de plan à tout moment ?', r: 'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Les changements prennent effet immédiatement.' },
              { q: 'Y a-t-il un engagement minimum ?', r: 'Le plan mensuel est sans engagement. Le plan annuel est facturé en une fois avec une réduction de 17%.' },
              { q: 'Qu\'est-ce que le contenu local ?', r: 'Le module Contenu Local vous permet de mesurer et reporter le taux d\'utilisation de fournisseurs et talents locaux dans vos projets, conformément aux réglementations africaines.' },
              { q: 'Les données sont-elles isolées entre tenants ?', r: 'Absolument. Notre architecture multi-tenant avec Row Level Security (RLS) garantit une isolation stricte des données de chaque client.' },
            ].map(faq => (
              <div key={faq.q} className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-sm text-gray-600">{faq.r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
