import React, { useState } from 'react';
import { Settings, Mail, Webhook, Key, Bell, AlertTriangle } from 'lucide-react';

const SettingsTab: React.FC = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <div className="space-y-6">
      {/* General */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-4 h-4 text-[#0D2B55]" />
          <h3 className="text-sm font-semibold text-gray-900">Paramètres généraux</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Notifications email</p>
              <p className="text-xs text-gray-500">Recevoir des alertes par email</p>
            </div>
            <button onClick={() => setEmailNotifications(!emailNotifications)} className={`relative w-10 h-5 rounded-full transition-colors ${emailNotifications ? 'bg-[#0D2B55]' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${emailNotifications ? 'translate-x-5' : ''}`}></span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Notifications Slack</p>
              <p className="text-xs text-gray-500">Intégration Slack (non connecté)</p>
            </div>
            <button onClick={() => setSlackNotifications(!slackNotifications)} className={`relative w-10 h-5 rounded-full transition-colors ${slackNotifications ? 'bg-[#0D2B55]' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${slackNotifications ? 'translate-x-5' : ''}`}></span>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 flex items-center space-x-2">
                <span>Mode maintenance</span>
                {maintenanceMode && <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">Actif</span>}
              </p>
              <p className="text-xs text-gray-500">Bloquer l'accès aux utilisateurs non-admin</p>
            </div>
            <button onClick={() => setMaintenanceMode(!maintenanceMode)} className={`relative w-10 h-5 rounded-full transition-colors ${maintenanceMode ? 'bg-orange-500' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${maintenanceMode ? 'translate-x-5' : ''}`}></span>
            </button>
          </div>
        </div>
      </div>

      {/* SMTP */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center space-x-2 mb-4">
          <Mail className="w-4 h-4 text-[#0D2B55]" />
          <h3 className="text-sm font-semibold text-gray-900">Configuration Email SMTP</h3>
          <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Non connecté</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[{ label: 'Serveur SMTP', placeholder: 'smtp.gmail.com' }, { label: 'Port', placeholder: '587' }, { label: 'Utilisateur', placeholder: 'user@domain.com' }, { label: 'Mot de passe', placeholder: '••••••••', type: 'password' }].map(f => (
            <div key={f.label}>
              <label className="block text-xs font-medium text-gray-700 mb-1">{f.label}</label>
              <input type={f.type || 'text'} placeholder={f.placeholder} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0D2B55]" />
            </div>
          ))}
        </div>
        <button className="mt-3 px-4 py-2 bg-[#0D2B55] text-white text-sm font-medium rounded-lg hover:bg-[#1a3f6f] transition-colors">Enregistrer</button>
      </div>

      {/* API Keys */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Key className="w-4 h-4 text-[#0D2B55]" />
            <h3 className="text-sm font-semibold text-gray-900">Clés API</h3>
          </div>
          <button className="text-xs text-[#0D2B55] hover:underline font-medium">+ Générer une nouvelle clé</button>
        </div>
        <div className="space-y-2">
          {[{ name: 'Production API Key', key: 'sk_prod_••••••••••••••••4f8a', created: '12 Jan 2026' }, { name: 'Development API Key', key: 'sk_dev_••••••••••••••••7c2b', created: '3 Mar 2026' }].map(k => (
            <div key={k.name} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5">
              <div>
                <p className="text-sm font-medium text-gray-900">{k.name}</p>
                <p className="text-xs font-mono text-gray-500">{k.key}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400">{k.created}</span>
                <button className="text-xs text-red-500 hover:text-red-700 font-medium">Révoquer</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Webhooks */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Webhook className="w-4 h-4 text-[#0D2B55]" />
            <h3 className="text-sm font-semibold text-gray-900">Webhooks</h3>
          </div>
          <button className="text-xs text-[#0D2B55] hover:underline font-medium">+ Ajouter un webhook</button>
        </div>
        <div className="space-y-2">
          {[{ url: 'https://hooks.zapier.com/hooks/catch/...', events: 'passport.created, talent.added', active: true }, { url: 'https://api.company.com/webhooks/ingi', events: 'project.published', active: false }].map((w, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5">
              <div>
                <p className="text-xs font-mono text-gray-900 truncate max-w-xs">{w.url}</p>
                <p className="text-xs text-gray-500">{w.events}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${w.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {w.active ? 'Actif' : 'Inactif'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
