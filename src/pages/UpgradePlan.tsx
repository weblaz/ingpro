import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { useSubscription } from '../contexts/SubscriptionContext';
import { TrendingUp, CheckCircle2, ArrowRight, Lock, Phone } from 'lucide-react';
import { PLANS } from '../types/subscription';

const UpgradePlan: React.FC = () => {
  const { plan } = useSubscription();
  const [searchParams] = useSearchParams();
  const highlighted = searchParams.get('plan') || 'pro';

  const upgradablePlans = PLANS.filter(p => {
    const order = ['starter', 'pro', 'enterprise', 'government'];
    return order.indexOf(p.id) > order.indexOf(plan);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 mb-4 px-3 py-1.5 bg-blue-50 rounded-full">
            <TrendingUp className="w-4 h-4 text-[#0D2B55]" />
            <span className="text-sm font-medium text-[#0D2B55]">Plan actuel : <span className="capitalize font-bold">{plan}</span></span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Passez à la vitesse supérieure</h1>
          <p className="text-gray-500">Débloquez tous les modules pour transformer votre gouvernance industrielle</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start space-x-3">
          <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Mise à niveau sécurisée</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Les changements de plan sont traités via notre équipe commerciale pour garantir la sécurité de votre abonnement.
              Contactez-nous pour activer votre nouveau plan immédiatement.
            </p>
          </div>
        </div>

        {upgradablePlans.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Vous avez le plan maximum !</h2>
            <p className="text-gray-500 mb-6">Vous bénéficiez déjà de toutes les fonctionnalités de la plateforme.</p>
            <Link to="/dashboard" className="inline-flex items-center space-x-2 px-6 py-3 bg-[#0D2B55] text-white font-semibold rounded-xl">
              <span>Retour au tableau de bord</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upgradablePlans.map(p => (
              <div key={p.id} className={`bg-white rounded-2xl border-2 p-6 flex flex-col ${p.id === highlighted ? 'border-[#0D2B55] shadow-xl' : 'border-gray-200'}`}>
                {p.id === highlighted && (
                  <span className="text-xs font-semibold bg-[#0D2B55] text-white px-2.5 py-1 rounded-full w-fit mb-3">⭐ Recommandé</span>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-1">{p.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{p.description}</p>
                <div className="mb-4">
                  {p.monthlyPrice === 0 ? (
                    <p className="text-2xl font-bold text-gray-900">Sur devis</p>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">${p.annualPrice}<span className="text-sm font-normal text-gray-400">/mois</span></p>
                  )}
                </div>
                <ul className="space-y-2 flex-1 mb-5">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start space-x-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/contact?plan=${p.id}`}
                  className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold text-sm transition-colors ${p.id === highlighted ? 'bg-[#0D2B55] text-white hover:bg-[#1a3f6f]' : 'border-2 border-[#0D2B55] text-[#0D2B55] hover:bg-blue-50'}`}
                >
                  <Phone className="w-4 h-4" />
                  <span>Contacter l'équipe commerciale</span>
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link to="/pricing" className="text-sm text-[#0D2B55] hover:underline font-medium">Comparer tous les plans →</Link>
        </div>
      </main>
    </div>
  );
};

export default UpgradePlan;