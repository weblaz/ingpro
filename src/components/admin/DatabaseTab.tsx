import React from 'react';
import { Database, Activity, HardDrive, Zap, Clock, AlertCircle } from 'lucide-react';

const DB_STATS = [
  { label: 'Connexions actives', value: '24 / 100', icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
  { label: 'Taille de la BD', value: '2.4 GB', icon: HardDrive, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Latence moyenne', value: '12 ms', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { label: 'Uptime', value: '99.98%', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
];

const TABLES = [
  { name: 'tenants', rows: 47, size: '128 KB', rls: true },
  { name: 'users', rows: 312, size: '256 KB', rls: true },
  { name: 'company_passports', rows: 1847, size: '1.2 MB', rls: true },
  { name: 'digital_identities', rows: 2934, size: '2.1 MB', rls: true },
  { name: 'subcontracting_projects', rows: 456, size: '512 KB', rls: true },
  { name: 'talents', rows: 1234, size: '896 KB', rls: true },
  { name: 'trainings', rows: 89, size: '192 KB', rls: true },
  { name: 'local_content_projects', rows: 234, size: '320 KB', rls: true },
  { name: 'demo_requests', rows: 78, size: '64 KB', rls: true },
  { name: 'translations', rows: 15600, size: '4.8 MB', rls: true },
];

const DatabaseTab: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {DB_STATS.map(s => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`p-2.5 rounded-lg ${s.bg} w-fit mb-3`}>
              <Icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        );
      })}
    </div>

    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-[#0D2B55]" />
          <h3 className="text-sm font-semibold text-gray-900">Tables Supabase (17 tables)</h3>
        </div>
        <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">RLS activé sur toutes</span>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Table</th>
            <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">Lignes</th>
            <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">Taille</th>
            <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">RLS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {TABLES.map(t => (
            <tr key={t.name} className="hover:bg-gray-50">
              <td className="px-4 py-2.5 font-mono text-xs text-gray-900">{t.name}</td>
              <td className="px-4 py-2.5 text-right text-xs text-gray-600">{t.rows.toLocaleString()}</td>
              <td className="px-4 py-2.5 text-right text-xs text-gray-600">{t.size}</td>
              <td className="px-4 py-2.5 text-right">
                <span className="inline-flex items-center space-x-1 text-xs text-green-600">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
                  <span>Actif</span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default DatabaseTab;
