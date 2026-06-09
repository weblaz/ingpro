import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { CreditCard, Download, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';
import { PLANS } from '../types/subscription';

const INVOICES = [
  { id: 'INV-2026-06', date: '01 Jun 2026', amount: '$579.00', status: 'Payée', plan: 'Pro Annuel' },
  { id: 'INV-2026-05', date: '01 Mai 2026', amount: '$579.00', status: 'Payée', plan: 'Pro Annuel' },
  { id: 'INV-2026-04', date: '01 Avr 2026', amount: '$579.00', status: 'Payée', plan: 'Pro Annuel' },
];

const Billing: React.FC = () => {
  const { user } = useAuth();
  const { plan } = useSubscription();
  const currentPlan = PLANS.find(p => p.id === plan) || PLANS[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <CreditCard className="w-6 h-6 text-[#0D2B55]" /><span>Facturation & Abonnement</span>
          </h1>
          <p className="text-gray-500 mt-1">Gérez votre plan et consultez vos factures</p>
        </div>

        {/* Current plan */}
        <div className="bg-[#0D2B55] rounded-2xl p-6 text-white mb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-300 mb-1">Plan actuel</p>
              <h2 className="text-2xl font-bold capitalize">{currentPlan.name}</h2>
              <p className="text-gray-300 text-sm mt-1">{currentPlan.description}</p>
            </div>
            <span className="px-3 py-1 bg-teal-400/20 border border-teal-400/30 text-teal-300 text-sm font-medium rounded-full">Actif</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {currentPlan.features.slice(0, 4).map(f => (
              <div key={f} className="flex items-center space-x-1.5 text-sm text-gray-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                <span>{f}</span>
              </div>
            ))}
          </div>
          {plan !== 'government' && (
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
              <p className="text-sm text-gray-300">Prochain renouvellement : <span className="text-white font-medium">01 Jan 2027</span></p>
              <Link to="/upgrade" className="flex items-center space-x-1.5 text-sm text-teal-300 hover:text-white transition-colors">
                <TrendingUp className="w-4 h-4" /><span>Mettre à niveau</span><ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Payment method */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Méthode de paiement</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-7 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
              <div>
                <p className="text-sm font-medium text-gray-900">•••• •••• •••• 4242</p>
                <p className="text-xs text-gray-500">Expire 12/2028</p>
              </div>
            </div>
            <button className="text-sm text-[#0D2B55] hover:underline font-medium">Modifier</button>
          </div>
        </div>

        {/* Invoices */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center space-x-2 px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Historique des factures</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {INVOICES.map(inv => (
              <div key={inv.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{inv.id}</p>
                  <p className="text-xs text-gray-500">{inv.date} · {inv.plan}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-semibold text-gray-900">{inv.amount}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{inv.status}</span>
                  <button className="flex items-center space-x-1 text-xs text-[#0D2B55] hover:underline">
                    <Download className="w-3.5 h-3.5" /><span>PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Billing;
