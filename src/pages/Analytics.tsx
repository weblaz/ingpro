import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { supabase } from '../supabase/client';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { BarChart3, TrendingUp, Star, Users, AlertCircle, Loader2 } from 'lucide-react';

interface AnalyticsData {
  passportsByCountry: { name: string; count: number }[];
  projectsByStatus: { name: string; value: number; color: string }[];
  enrollmentsByMonth: { month: string; inscriptions: number }[];
  kpis: {
    totalPassports: number;
    totalTalents: number;
    totalProjects: number;
    avgTrustScore: number;
  };
}

const STATUS_LABELS: Record<string, string> = {
  open: 'Ouvert', closed: 'Fermé', in_progress: 'En cours', completed: 'Terminé',
};
const STATUS_COLORS: Record<string, string> = {
  open: '#0D2B55', in_progress: '#1E88E5', completed: '#43A047', closed: '#9E9E9E',
};
const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user?.tenant) return;
      setLoading(true);
      setError(null);

      try {
        const [
          passportsRes,
          talentsRes,
          projectsRes,
          enrollmentsRes,
          trustRes,
        ] = await Promise.all([
          // Passeports par pays
          supabase
            .from('company_passports')
            .select('country')
            .eq('tenant_id', user.tenant),

          // Count talents
          supabase
            .from('talents')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', user.tenant),

          // Projets par statut
          supabase
            .from('subcontracting_projects')
            .select('status')
            .eq('tenant_id', user.tenant),

          // Inscriptions formations (pour tendance mensuelle)
          supabase
            .from('training_enrollments')
            .select('created_at')
            .eq('tenant_id', user.tenant),

          // Score de confiance moyen
          supabase
            .from('company_passports')
            .select('trust_score')
            .eq('tenant_id', user.tenant),
        ]);

        // ── Passeports par pays ───────────────────────────────────────────
        const countryMap: Record<string, number> = {};
        for (const p of passportsRes.data || []) {
          if (p.country) countryMap[p.country] = (countryMap[p.country] || 0) + 1;
        }
        const passportsByCountry = Object.entries(countryMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);

        // ── Projets par statut ────────────────────────────────────────────
        const statusMap: Record<string, number> = {};
        for (const p of projectsRes.data || []) {
          const s = p.status || 'unknown';
          statusMap[s] = (statusMap[s] || 0) + 1;
        }
        const projectsByStatus = Object.entries(statusMap).map(([key, value]) => ({
          name: STATUS_LABELS[key] || key,
          value,
          color: STATUS_COLORS[key] || '#9E9E9E',
        }));

        // ── Inscriptions par mois (12 derniers mois) ──────────────────────
        const monthMap: Record<number, number> = {};
        for (let i = 0; i < 12; i++) monthMap[i] = 0;
        const now = new Date();
        for (const e of enrollmentsRes.data || []) {
          const d = new Date(e.created_at);
          const diffMonths = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
          if (diffMonths >= 0 && diffMonths < 12) {
            monthMap[11 - diffMonths] = (monthMap[11 - diffMonths] || 0) + 1;
          }
        }
        const enrollmentsByMonth = Array.from({ length: 12 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
          return {
            month: MONTH_LABELS[d.getMonth()],
            inscriptions: monthMap[i] || 0,
          };
        });

        // ── Score moyen ───────────────────────────────────────────────────
        const scores = (trustRes.data || []).map(r => r.trust_score).filter(Boolean);
        const avgTrustScore = scores.length
          ? Math.round(scores.reduce((s, n) => s + n, 0) / scores.length)
          : 0;

        setData({
          passportsByCountry,
          projectsByStatus,
          enrollmentsByMonth,
          kpis: {
            totalPassports: passportsRes.data?.length || 0,
            totalTalents: talentsRes.count || 0,
            totalProjects: projectsRes.data?.length || 0,
            avgTrustScore,
          },
        });
      } catch (err: any) {
        console.error('Analytics error:', err);
        setError('Erreur lors du chargement des données. Vérifiez vos permissions.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-[#0D2B55]" />
            <span>Analytics & Reporting</span>
          </h1>
          <p className="text-gray-500 mt-1">Données réelles de votre organisation — mises à jour en temps réel</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#0D2B55] mx-auto mb-3" />
              <p className="text-sm text-gray-500">Chargement des données...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">Erreur de chargement</p>
              <p className="text-sm text-red-600 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Data */}
        {!loading && !error && data && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Passeports créés', value: data.kpis.totalPassports, icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                { label: 'Talents enregistrés', value: data.kpis.totalTalents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Projets publiés', value: data.kpis.totalProjects, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Score confiance moyen', value: `${data.kpis.avgTrustScore}/100`, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className={`p-2 rounded-lg ${s.bg} w-fit mb-2`}>
                      <Icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                    <p className="text-xl font-bold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Passeports par pays */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Passeports par pays</h3>
                {data.passportsByCountry.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                    Aucun passeport créé pour le moment
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.passportsByCountry} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                      <Tooltip formatter={(v: any) => [`${v} passeport(s)`, 'Nombre']} />
                      <Bar dataKey="count" fill="#0D2B55" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Projets par statut */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Projets de sous-traitance par statut</h3>
                {data.projectsByStatus.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                    Aucun projet publié pour le moment
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={data.projectsByStatus}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={90}
                        dataKey="value"
                        label={({ name, value }) => `${name} (${value})`}
                        labelLine={false}
                      >
                        {data.projectsByStatus.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => [`${v} projet(s)`, '']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Inscriptions par mois */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Inscriptions aux formations — 12 derniers mois
              </h3>
              {data.enrollmentsByMonth.every(d => d.inscriptions === 0) ? (
                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                  Aucune inscription enregistrée sur cette période
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={data.enrollmentsByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip formatter={(v: any) => [`${v} inscription(s)`, '']} />
                    <Line
                      type="monotone"
                      dataKey="inscriptions"
                      stroke="#0D2B55"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Inscriptions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Analytics;
