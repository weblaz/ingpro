import React from 'react';
import Header from '../components/Header';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, TrendingUp, Star, Users } from 'lucide-react';

const supplierScores = [
  { name: 'Total DZ', score: 94 }, { name: 'Sonatrach Partners', score: 87 }, { name: 'Ifri Group', score: 82 },
  { name: 'Cevital', score: 78 }, { name: 'Algérie Télécom', score: 71 }, { name: 'Cosider', score: 68 },
];
const monthlyTrend = [
  { month: 'Jan', certifications: 45, projects: 23 }, { month: 'Fév', certifications: 52, projects: 28 },
  { month: 'Mar', certifications: 61, projects: 35 }, { month: 'Avr', certifications: 58, projects: 31 },
  { month: 'Mai', certifications: 73, projects: 42 }, { month: 'Jun', certifications: 89, projects: 51 },
];
const sectorData = [
  { name: 'Pétrole & Gaz', value: 35, color: '#0D2B55' },
  { name: 'BTP', value: 25, color: '#1E88E5' },
  { name: 'Mines', value: 18, color: '#43A047' },
  { name: 'Agriculture', value: 12, color: '#FB8C00' },
  { name: 'Autres', value: 10, color: '#8E24AA' },
];

const Analytics: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <Header />
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-[#0D2B55]" /><span>Analytics & Scoring</span>
        </h1>
        <p className="text-gray-500 mt-1">Tableaux de bord intelligents pour décisions data-driven</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Score moyen fournisseurs', value: '79/100', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Certifications ce mois', value: '+89', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Talents évalués', value: '1,234', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Projets analysés', value: '456', icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className={`p-2 rounded-lg ${s.bg} w-fit mb-2`}><Icon className={`w-5 h-5 ${s.color}`} /></div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Supplier Scores */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Scores fournisseurs (Top 6)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={supplierScores} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
              <Tooltip />
              <Bar dataKey="score" fill="#0D2B55" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Tendance mensuelle</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="certifications" stroke="#0D2B55" strokeWidth={2} dot={{ r: 3 }} name="Certifications" />
              <Line type="monotone" dataKey="projects" stroke="#1E88E5" strokeWidth={2} dot={{ r: 3 }} name="Projets" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sector Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Répartition par secteur</h3>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie data={sectorData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value">
                {sectorData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v: any) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sectorData.map(s => (
              <div key={s.name} className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{s.name}</p>
                  <div className="h-1.5 bg-gray-200 rounded-full mt-1">
                    <div className="h-full rounded-full" style={{ width: `${s.value * 3}%`, backgroundColor: s.color }}></div>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  </div>
);

export default Analytics;
