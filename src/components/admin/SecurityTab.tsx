import React from 'react';
import { Shield, Lock, AlertTriangle, CheckCircle2, Eye, Clock } from 'lucide-react';

const SECURITY_ITEMS = [
  { label: 'Row Level Security (RLS)', status: 'ok', detail: 'Activé sur 17/17 tables' },
  { label: 'Authentification Supabase Auth', status: 'ok', detail: 'signInWithPassword actif' },
  { label: 'Sessions JWT', status: 'ok', detail: 'Expiration 1h, refresh auto' },
  { label: 'HTTPS / TLS 1.3', status: 'ok', detail: 'Certificat valide' },
  { label: 'MFA (2FA)', status: 'partial', detail: 'UI disponible, non connecté à Supabase Auth' },
  { label: 'Intégration Stripe', status: 'missing', detail: 'Paiements non sécurisés' },
  { label: 'Webhooks signature', status: 'missing', detail: 'Validation HMAC non implémentée' },
  { label: 'Rate limiting', status: 'partial', detail: 'Géré par Supabase côté API' },
];

const STATUS_CONFIG = {
  ok: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'OK' },
  partial: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Partiel' },
  missing: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50', label: 'Manquant' },
};

const RECENT_EVENTS = [
  { type: 'login', user: 'ahmed.benali@total.com', time: 'Il y a 2 min', ok: true },
  { type: 'login_failed', user: 'unknown@example.com', time: 'Il y a 15 min', ok: false },
  { type: 'signup', user: 'kofi.mensah@ghanagas.com', time: 'Il y a 1h', ok: true },
  { type: 'logout', user: 'marie.dupont@total.com', time: 'Il y a 3h', ok: true },
];

const SecurityTab: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
        <p className="text-2xl font-bold text-green-700">6</p>
        <p className="text-sm text-green-600 mt-0.5">Contrôles passés</p>
      </div>
      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
        <p className="text-2xl font-bold text-yellow-700">2</p>
        <p className="text-sm text-yellow-600 mt-0.5">Partiellement conformes</p>
      </div>
      <div className="bg-red-50 rounded-xl p-4 border border-red-200">
        <p className="text-2xl font-bold text-red-600">2</p>
        <p className="text-sm text-red-500 mt-0.5">Contrôles manquants</p>
      </div>
    </div>

    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center space-x-2 px-4 py-3 border-b border-gray-100">
        <Shield className="w-4 h-4 text-[#0D2B55]" />
        <h3 className="text-sm font-semibold text-gray-900">Audit de sécurité</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {SECURITY_ITEMS.map(item => {
          const cfg = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG];
          const Icon = cfg.icon;
          return (
            <div key={item.label} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${cfg.color}`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.detail}</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>

    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center space-x-2 px-4 py-3 border-b border-gray-100">
        <Clock className="w-4 h-4 text-[#0D2B55]" />
        <h3 className="text-sm font-semibold text-gray-900">Journal d'activité récent</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {RECENT_EVENTS.map((e, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${e.ok ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <p className="text-sm text-gray-900">{e.type === 'login' ? 'Connexion réussie' : e.type === 'login_failed' ? 'Tentative de connexion échouée' : e.type === 'signup' ? 'Inscription' : 'Déconnexion'}</p>
                <p className="text-xs text-gray-500">{e.user}</p>
              </div>
            </div>
            <span className="text-xs text-gray-400">{e.time}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default SecurityTab;
