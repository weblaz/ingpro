import React, { useState } from 'react';
import Header from '../components/Header';
import UserManagementTab from '../components/admin/UserManagementTab';
import DatabaseTab from '../components/admin/DatabaseTab';
import SecurityTab from '../components/admin/SecurityTab';
import RegionsTab from '../components/admin/RegionsTab';
import SettingsTab from '../components/admin/SettingsTab';
import { Settings, Users, Database, Shield, Globe, Building2 } from 'lucide-react';

const TABS = [
  { id: 'tenants', label: 'Tenants', icon: Building2 },
  { id: 'users', label: 'Utilisateurs', icon: Users },
  { id: 'database', label: 'Base de données', icon: Database },
  { id: 'security', label: 'Sécurité', icon: Shield },
  { id: 'regions', label: 'Régions', icon: Globe },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

const MOCK_TENANTS = [
  { name: 'Total Energies DZ', plan: 'enterprise', users: 47, status: 'active', country: 'Algérie' },
  { name: 'Saudi Aramco Africa', plan: 'government', users: 123, status: 'active', country: 'Arabie Saoudite' },
  { name: 'Airbus Helicopters', plan: 'pro', users: 28, status: 'active', country: 'France' },
  { name: 'Lagos Industrial Ltd', plan: 'starter', users: 5, status: 'active', country: 'Nigeria' },
  { name: 'Cosider Group', plan: 'pro', users: 34, status: 'suspended', country: 'Algérie' },
];

const PLAN_COLORS: Record<string, string> = {
  starter: 'bg-gray-100 text-gray-600',
  pro: 'bg-purple-100 text-purple-700',
  enterprise: 'bg-blue-100 text-blue-700',
  government: 'bg-orange-100 text-orange-700',
};

const Admin: React.FC = () => {
  const [tab, setTab] = useState('tenants');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Settings className="w-6 h-6 text-[#0D2B55]" /><span>Console d'Administration</span>
          </h1>
          <p className="text-gray-500 mt-1">Gestion globale de la plateforme INGI Synertran</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Tenants actifs', value: '47' },
            { label: 'Utilisateurs totaux', value: '312' },
            { label: 'Requêtes / jour', value: '24,891' },
            { label: 'Uptime', value: '99.98%' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tab nav */}
        <div className="flex space-x-1 overflow-x-auto bg-gray-100 rounded-xl p-1 mb-6">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${tab === t.id ? 'bg-white text-[#0D2B55] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {tab === 'tenants' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center space-x-2 px-4 py-3 border-b border-gray-100">
              <Building2 className="w-4 h-4 text-[#0D2B55]" />
              <h3 className="text-sm font-semibold text-gray-900">Tenants ({MOCK_TENANTS.length})</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Entreprise</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Plan</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Utilisateurs</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Pays</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MOCK_TENANTS.map(t => (
                  <tr key={t.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${PLAN_COLORS[t.plan]}`}>{t.plan}</span></td>
                    <td className="px-4 py-3 text-gray-600">{t.users}</td>
                    <td className="px-4 py-3 text-gray-600">{t.country}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {t.status === 'active' ? 'Actif' : 'Suspendu'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === 'users' && <UserManagementTab />}
        {tab === 'database' && <DatabaseTab />}
        {tab === 'security' && <SecurityTab />}
        {tab === 'regions' && <RegionsTab />}
        {tab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
};

export default Admin;
