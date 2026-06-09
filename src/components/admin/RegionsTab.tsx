import React from 'react';
import { Globe, MapPin, Server, CheckCircle2, Clock } from 'lucide-react';

const REGIONS = [
  { name: 'Afrique du Nord', code: 'af-north', servers: ['Alger', 'Tunis', 'Le Caire'], status: 'active', latency: '8ms', users: 1247 },
  { name: 'Afrique de l\'Ouest', code: 'af-west', servers: ['Lagos', 'Abidjan', 'Dakar'], status: 'active', latency: '22ms', users: 892 },
  { name: 'Afrique de l\'Est', code: 'af-east', servers: ['Nairobi'], status: 'planned', latency: 'N/A', users: 0 },
  { name: 'Moyen-Orient', code: 'me', servers: ['Riyad', 'Dubaï'], status: 'active', latency: '15ms', users: 456 },
  { name: 'Europe', code: 'eu', servers: ['Paris', 'Francfort'], status: 'active', latency: '45ms', users: 234 },
];

const RegionsTab: React.FC = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <Globe className="w-5 h-5 text-blue-600 mb-2" />
        <p className="text-2xl font-bold text-gray-900">5</p>
        <p className="text-xs text-gray-500">Régions configurées</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <Server className="w-5 h-5 text-green-600 mb-2" />
        <p className="text-2xl font-bold text-gray-900">12</p>
        <p className="text-xs text-gray-500">Serveurs actifs</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <MapPin className="w-5 h-5 text-purple-600 mb-2" />
        <p className="text-2xl font-bold text-gray-900">2,829</p>
        <p className="text-xs text-gray-500">Utilisateurs répartis</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <Clock className="w-5 h-5 text-orange-600 mb-2" />
        <p className="text-2xl font-bold text-gray-900">99.98%</p>
        <p className="text-xs text-gray-500">Disponibilité globale</p>
      </div>
    </div>

    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center space-x-2 px-4 py-3 border-b border-gray-100">
        <Globe className="w-4 h-4 text-[#0D2B55]" />
        <h3 className="text-sm font-semibold text-gray-900">Déploiement multi-régions</h3>
      </div>
      <div className="divide-y divide-gray-50">
        {REGIONS.map(r => (
          <div key={r.code} className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center space-x-3">
              <div className={`w-2.5 h-2.5 rounded-full ${r.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div>
                <p className="text-sm font-medium text-gray-900">{r.name}</p>
                <p className="text-xs text-gray-500">{r.servers.join(' · ')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-right">
              <div>
                <p className="text-sm font-medium text-gray-900">{r.users.toLocaleString()}</p>
                <p className="text-xs text-gray-500">utilisateurs</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{r.latency}</p>
                <p className="text-xs text-gray-500">latence</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {r.status === 'active' ? 'Actif' : 'Planifié'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default RegionsTab;
