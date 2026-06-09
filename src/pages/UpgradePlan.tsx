import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { supabase } from '../supabase/client';
import { toast } from 'react-toastify';
import { TrendingUp, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { PLANS } from '../types/subscription';

const UpgradePlan: React.FC = () => {
  const { user } = useAuth();
  const { plan } = useSubscription();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const highlighted = searchParams.get('plan') || 'pro';

  const upgradablePlans = PLANS.filter(p => {
    const order = ['starter', 'pro', 'enterprise', 'government'];
    return order.indexOf(p.id) > order.indexOf(plan);
  });

  const handleUpgrade = async (planId: string) => {
    if (planId === 'government') { window.location.href = '/contact?plan=government'; return; }
    if (!user?.tenant) return;
    setLoading(planId);
    try {
      const { error } = await supabase.from('tenants').update({ subscription_plan: planId }).eq('id', user.tenant);
      if (error) throw error;
      toast.success(`Félicitations ! Plan ${planId} activé.`);
      window.location.href = '/dashboard';
    } catch (err: any) {
      toast.error(err.message || 'Erreur');
    } finally {
      setLoading(null);
    }
  };

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
                <button
                  onClick={() => handleUpgrade(p.id)}
                  disabled={loading === p.id}
                  className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 ${p.id === highlighted ? 'bg-[#0D2B55] text-white hover:bg-[#1a3f6f]' : 'border-2 border-[#0D2B55] text-[#0D2B55] hover:bg-blue-50'}`}
                >
                  {loading === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  <span>{loading === p.id ? 'Activation...' : p.id === 'government' ? 'Nous contacter' : `Passer au ${p.name}`}</span>
                </button>
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
